'use client';

import { useEffect, useState } from "react";
import FastRender from "fastrender";

const FULL_RESPONSE = `# Real-time Math and Text Rendering

Let me explain some fundamental physics concepts. At the heart of modern physics lies Einstein's famous equation:

$E = mc^2$

This elegant equation demonstrates the deep relationship between mass and energy in our universe. The $E$ represents energy, $m$ is mass, and $c$ is the speed of light.

## Quantum Mechanics

One of the most fascinating equations in quantum mechanics is the Schrödinger equation:

$$i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat H\\Psi(\\mathbf{r},t)$$

This equation describes how quantum states evolve over time. Here, $\\hbar$ is the reduced Planck constant, and $\\Psi$ represents the wave function.

## Maxwell's Equations

In electromagnetism, Maxwell's equations elegantly describe all classical electromagnetic phenomena:

$$
\\begin{align}
\\nabla \\cdot \\mathbf{E} &= \\frac{\\rho}{\\epsilon_0} \\\\
\\nabla \\cdot \\mathbf{B} &= 0 \\\\
\\nabla \\times \\mathbf{E} &= -\\frac{\\partial\\mathbf{B}}{\\partial t} \\\\
\\nabla \\times \\mathbf{B} &= \\mu_0\\mathbf{J} + \\mu_0\\epsilon_0\\frac{\\partial\\mathbf{E}}{\\partial t}
\\end{align}
$$`;

export default function Home() {
  const [renderedContent, setRenderedContent] = useState<string>("");
  const [currentText, setCurrentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamingComplete, setStreamingComplete] = useState(false);
  const [renderer, setRenderer] = useState<FastRender | null>(null);

  // Initialize the renderer
  useEffect(() => {
    const initRenderer = async () => {
      try {
        const newRenderer = new FastRender({
          debug: false,
          katexOptions: {
            throwOnError: false,
            strict: false
          }
        });
        setRenderer(newRenderer);
        setIsLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize renderer');
        setIsLoading(false);
      }
    };

    initRenderer();
  }, []);

  // Simulate streaming
  useEffect(() => {
    if (!renderer || streamingComplete || isLoading) return;

    let currentPosition = 0;
    let buffer = "";
    let mathBuffer = "";
    let inMath = false;
    let mathDelimiter = "";

    const streamText = async () => {
      if (currentPosition >= FULL_RESPONSE.length) {
        setStreamingComplete(true);
        return;
      }

      const char = FULL_RESPONSE[currentPosition];
      
      // Handle math delimiters
      if ((char === '$' && FULL_RESPONSE[currentPosition + 1] === '$') || 
          (char === '$' && FULL_RESPONSE[currentPosition - 1] !== '$')) {
        if (!inMath) {
          // Starting math
          inMath = true;
          mathDelimiter = char === '$' && FULL_RESPONSE[currentPosition + 1] === '$' ? '$$' : '$';
          mathBuffer = mathDelimiter;
          if (mathDelimiter === '$$') currentPosition++;
        } else if ((mathDelimiter === '$$' && char === '$' && FULL_RESPONSE[currentPosition + 1] === '$') ||
                   (mathDelimiter === '$' && char === '$')) {
          // Ending math
          inMath = false;
          mathBuffer += mathDelimiter;
          buffer += mathBuffer;
          mathBuffer = "";
          if (mathDelimiter === '$$') currentPosition++;
          
          // Render the accumulated text
          try {
            const rendered = await renderer.renderMixed(buffer);
            setRenderedContent(rendered);
            setCurrentText(buffer);
          } catch (err) {
            console.error('Render error:', err);
          }
        }
      } else if (inMath) {
        // Accumulate math content
        mathBuffer += char;
      } else {
        // Regular text
        buffer += char;
        // Render every few characters instead of every word for smoother fast streaming
        if (currentPosition % 3 === 0 || char === '\n') {
          // Render at word boundaries
          try {
            const rendered = await renderer.renderMixed(buffer);
            setRenderedContent(rendered);
            setCurrentText(buffer);
          } catch (err) {
            console.error('Render error:', err);
          }
        }
      }

      currentPosition++;
      setTimeout(streamText, Math.random() * 8 + 2); // Random delay between 2-10ms for Groq-like speed
    };

    streamText();
  }, [renderer, isLoading, streamingComplete]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">FastRender Demo</h1>
          <div className="flex items-center gap-2">
            {!streamingComplete && !isLoading && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-pulse">●</div>
                Streaming...
              </div>
            )}
            {streamingComplete && (
              <div className="text-green-600">
                ✓ Complete
              </div>
            )}
          </div>
        </div>
        
        {isLoading && (
          <div className="p-4 bg-blue-50 text-blue-700 rounded">
            Loading renderer...
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded">
            Error: {error}
          </div>
        )}

        {renderedContent && (
          <div className="relative">
            <div 
              className="prose prose-lg max-w-none prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:rounded-lg"
              dangerouslySetInnerHTML={{ __html: renderedContent }} 
            />
            {!streamingComplete && !isLoading && (
              <div className="h-4 w-4 mt-4">
                <div className="animate-pulse">▋</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
