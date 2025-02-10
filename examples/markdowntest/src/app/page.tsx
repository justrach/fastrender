'use client';

import { useEffect, useState } from "react";
import FastRender from "fastrender";
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

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




`;


const remarkProcessor = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkRehype)
  .use(rehypeKatex)
  .use(rehypeStringify);

export default function Home() {
  const [fastRenderContent, setFastRenderContent] = useState<string>("");
  const [remarkContent, setRemarkContent] = useState<string>("");
  const [currentText, setCurrentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamingComplete, setStreamingComplete] = useState(false);
  const [renderer, setRenderer] = useState<FastRender | null>(null);
  const [metrics, setMetrics] = useState<{
    fastRenderTime: number;
    remarkTime: number;
    renderCount: number;
  }>({
    fastRenderTime: 0,
    remarkTime: 0,
    renderCount: 0
  });

  // Add state for warmed up renderers
  const [warmedUp, setWarmedUp] = useState(false);

  // Initialize and warm up
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
        await newRenderer.initialize();

        // Warm up both renderers with multiple iterations
        const warmupContent = '# Warmup\n$E=mc^2$\n$$\\frac{1}{2}$$';
        for (let i = 0; i < 5; i++) {
          await Promise.all([
            newRenderer.renderMixed(warmupContent),
            remarkProcessor.process(warmupContent)
          ]);
        }

        setRenderer(newRenderer);
        setWarmedUp(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize renderer');
        setIsLoading(false);
      }
    };

    initRenderer();
  }, []);

  // Streaming effect
  useEffect(() => {
    if (!renderer || !warmedUp || streamingComplete || isLoading) return;

    let currentPosition = 0;
    let buffer = "";
    let mathBuffer = "";
    let inMath = false;
    let mathDelimiter = "";
    let isProcessing = false;

    const streamText = async () => {
      if (isProcessing) return;
      if (currentPosition >= FULL_RESPONSE.length) {
        setStreamingComplete(true);
        return;
      }

      isProcessing = true;
      const char = FULL_RESPONSE[currentPosition];
      
      // Handle math delimiters
      if ((char === '$' && FULL_RESPONSE[currentPosition + 1] === '$') || 
          (char === '$' && FULL_RESPONSE[currentPosition - 1] !== '$')) {
        if (!inMath) {
          inMath = true;
          mathDelimiter = char === '$' && FULL_RESPONSE[currentPosition + 1] === '$' ? '$$' : '$';
          mathBuffer = mathDelimiter;
          if (mathDelimiter === '$$') currentPosition++;
        } else if ((mathDelimiter === '$$' && char === '$' && FULL_RESPONSE[currentPosition + 1] === '$') ||
                   (mathDelimiter === '$' && char === '$')) {
          inMath = false;
          mathBuffer += mathDelimiter;
          buffer += mathBuffer;
          mathBuffer = "";
          if (mathDelimiter === '$$') currentPosition++;
          
          // Measure render time more accurately
          if (currentPosition % 3 === 0 || char === '\n') {
            try {
              const startFast = performance.now();
              const fastRendered = await renderer.renderMixed(buffer);
              const fastTime = performance.now() - startFast;

              const startRemark = performance.now();
              const remarkRendered = await remarkProcessor.process(buffer);
              const remarkTime = performance.now() - startRemark;

              setMetrics(prev => ({
                fastRenderTime: prev.fastRenderTime + fastTime,
                remarkTime: prev.remarkTime + remarkTime,
                renderCount: prev.renderCount + 1
              }));

              setFastRenderContent(fastRendered);
              setRemarkContent(remarkRendered.toString());
              setCurrentText(buffer);
            } catch (err) {
              console.error('Render error:', err);
            }
          }
        }
      } else if (inMath) {
        mathBuffer += char;
      } else {
        buffer += char;
        if (currentPosition % 3 === 0 || char === '\n') {
          try {
            // Measure render time more accurately
            const startFast = performance.now();
            const fastRendered = await renderer.renderMixed(buffer);
            const fastTime = performance.now() - startFast;

            const startRemark = performance.now();
            const remarkRendered = await remarkProcessor.process(buffer);
            const remarkTime = performance.now() - startRemark;

            setMetrics(prev => ({
              fastRenderTime: prev.fastRenderTime + fastTime,
              remarkTime: prev.remarkTime + remarkTime,
              renderCount: prev.renderCount + 1
            }));

            setFastRenderContent(fastRendered);
            setRemarkContent(remarkRendered.toString());
            setCurrentText(buffer);
          } catch (err) {
            console.error('Render error:', err);
          }
        }
      }

      currentPosition++;
      isProcessing = false;
      requestAnimationFrame(streamText);
    };

    streamText();
  }, [renderer, warmedUp, isLoading, streamingComplete]);

  const avgFastRenderTime = metrics.renderCount ? metrics.fastRenderTime / metrics.renderCount : 0;
  const avgRemarkTime = metrics.renderCount ? metrics.remarkTime / metrics.renderCount : 0;
  const speedDifference = avgRemarkTime ? ((avgRemarkTime - avgFastRenderTime) / avgRemarkTime * 100) : 0;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-8">
          <h1 className="text-3xl font-bold">Renderer Comparison</h1>
          
          {/* Performance Metrics */}
          {metrics.renderCount > 0 && (
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">FastRender Performance</h3>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-blue-600">
                    Average render time: {avgFastRenderTime.toFixed(2)}ms
                  </p>
                  {speedDifference > 0 && (
                    <p className="text-sm font-semibold text-blue-700">
                      {speedDifference.toFixed(1)}% faster than Remark
                    </p>
                  )}
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Remark Performance</h3>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-green-600">
                    Average render time: {avgRemarkTime.toFixed(2)}ms
                  </p>
                  {speedDifference < 0 && (
                    <p className="text-sm font-semibold text-green-700">
                      {(-speedDifference).toFixed(1)}% faster than FastRender
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Streaming Status */}
          <div className="flex items-center gap-2">
            {!streamingComplete && !isLoading && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-pulse">●</div>
                Streaming... ({metrics.renderCount} renders)
              </div>
            )}
            {streamingComplete && (
              <div className="text-green-600">
                ✓ Complete ({metrics.renderCount} total renders)
              </div>
            )}
          </div>
        </div>
        
        {isLoading && (
          <div className="p-4 bg-blue-50 text-blue-700 rounded">
            Loading renderers...
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-8">
          {/* FastRender Column */}
          <div>
            <div className="mb-4 p-2 bg-blue-50 rounded flex justify-between items-center">
              <h2 className="text-xl font-semibold text-blue-800">FastRender</h2>
              <span className="text-sm text-blue-600">WebAssembly-powered</span>
            </div>
            {fastRenderContent && (
              <div className="relative">
                <div 
                  className="prose prose-lg max-w-none prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:rounded-lg"
                  dangerouslySetInnerHTML={{ __html: fastRenderContent }} 
                />
                {!streamingComplete && !isLoading && (
                  <div className="h-4 w-4 mt-4">
                    <div className="animate-pulse">▋</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Remark Column */}
          <div>
            <div className="mb-4 p-2 bg-green-50 rounded flex justify-between items-center">
              <h2 className="text-xl font-semibold text-green-800">Remark</h2>
              <span className="text-sm text-green-600">JavaScript-based</span>
            </div>
            {remarkContent && (
              <div className="relative">
                <div 
                  className="prose prose-lg max-w-none prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:rounded-lg"
                  dangerouslySetInnerHTML={{ __html: remarkContent }} 
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
      </div>
    </div>
  );
}
