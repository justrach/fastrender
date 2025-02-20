'use client';

import { useEffect, useState } from "react";
import { FastRender } from "fastrender";
import Header from '../components/Header';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  choices: {
    delta?: {
      content?: string;
    };
    message?: {
      content: string;
    };
  }[];
}

export default function TestPage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamBuffer, setStreamBuffer] = useState('');

  useEffect(() => {
    const renderer = new FastRender({
      debug: false,
      katexOptions: {
        throwOnError: false,
        strict: false
      }
    });

    const fetchAndStream = async () => {
      try {
        await renderer.initialize();
        
        const messages: Message[] = [
          { role: 'system', content: 'You are an AI that writes Python scripts.' },
          { role: 'user', content: 'Write a Python script that generates random numbers. After that write a small javascript script that generates random numbers. and then e=mc2 in latex' }
        ];

        const response = await fetch('http://localhost:1337/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'qwen2.5-coder-7b-instruct',
            messages,
            temperature: 0.7,
            stream: true
          })
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('No response body received');
        }

        // Read the response as a stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode the chunk and split by lines
          const chunk = decoder.decode(value);
          const lines = (buffer + chunk).split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6);
              if (jsonStr === '[DONE]') continue;

              try {
                const data: ChatResponse = JSON.parse(jsonStr);
                const content = data.choices[0]?.delta?.content || '';
                if (content) {
                  setStreamBuffer(prev => {
                    const newBuffer = prev + content;
                    // Render the buffer when we have complete markdown blocks
                    if (
                      newBuffer.includes('\n\n') || 
                      newBuffer.includes('```') ||
                      newBuffer.includes('$$')
                    ) {
                      renderer.renderMixed(newBuffer).then(rendered => {
                        setContent(rendered);
                      });
                    }
                    return newBuffer;
                  });
                }
              } catch (e) {
                console.error('Error parsing JSON:', e);
              }
            }
          }
        }

        // Final render of any remaining content
        if (streamBuffer) {
          const finalRendered = await renderer.renderMixed(streamBuffer);
          setContent(finalRendered);
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch or render content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndStream();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Header title="LLM Response Test" />
        
        {isLoading && !content && (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            Error: {error}
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content }} />
          {isLoading && content && (
            <div className="mt-2 text-gray-400 animate-pulse">▌</div>
          )}
        </div>
      </div>
    </div>
  );
} 