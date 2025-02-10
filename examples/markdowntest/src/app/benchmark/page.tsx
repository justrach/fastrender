'use client';

import { useState } from "react";
import FastRender from "fastrender";
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

const TEST_CASES = {
  simple: `# Hello World
This is a simple test with **bold** and *italic* text.`,
  
  math: `# Math Test
Here's an inline equation: $E = mc^2$
And a display equation:
$$
\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}
$$`,
  
  complex: `# Complex Document
## Section 1
Here's a list:
- Item 1
- Item 2
  - Nested item
- Item 3

> Here's a blockquote with math: $\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$

$$
\\begin{align}
\\nabla \\times \\vec{\\mathbf{B}} -\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{E}}}{\\partial t} & = \\frac{4\\pi}{c}\\vec{\\mathbf{j}} \\\\
\\nabla \\cdot \\vec{\\mathbf{E}} & = 4 \\pi \\rho
\\end{align}
$$`
};

const remarkProcessor = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkRehype)
  .use(rehypeKatex)
  .use(rehypeStringify);

export default function BenchmarkPage() {
  const [results, setResults] = useState<{
    [key: string]: {
      fastRender: number;
      remark: number;
      difference: number;
    };
  }>({});
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [liveContent, setLiveContent] = useState({
    fastRender: '',
    remark: ''
  });

  const runBenchmark = async () => {
    setIsRunning(true);
    const renderer = new FastRender();
    await renderer.initialize();

    const newResults: typeof results = {};

    // Run benchmarks for each test case
    for (const [name, content] of Object.entries(TEST_CASES)) {
      // Warm up
      await renderer.renderMixed(content);
      await remarkProcessor.process(content);

      const iterations = 100;
      
      // FastRender timing
      const startFast = performance.now();
      for (let i = 0; i < iterations; i++) {
        await renderer.renderMixed(content);
      }
      const fastTime = (performance.now() - startFast) / iterations;

      // Remark timing
      const startRemark = performance.now();
      for (let i = 0; i < iterations; i++) {
        await remarkProcessor.process(content);
      }
      const remarkTime = (performance.now() - startRemark) / iterations;

      newResults[name] = {
        fastRender: fastTime,
        remark: remarkTime,
        difference: ((remarkTime - fastTime) / remarkTime) * 100
      };
    }

    setResults(newResults);
    setIsRunning(false);
  };

  const runLiveComparison = async (testName: string) => {
    setSelectedTest(testName);
    setLiveContent({ fastRender: '', remark: '' });
    
    const content = TEST_CASES[testName];
    const renderer = new FastRender();
    await renderer.initialize();

    // Start both renderers simultaneously
    Promise.all([
      renderer.renderMixed(content).then(result => {
        setLiveContent(prev => ({ ...prev, fastRender: result }));
      }),
      remarkProcessor.process(content).then(result => {
        setLiveContent(prev => ({ ...prev, remark: result.toString() }));
      })
    ]);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Raw Performance Benchmark</h1>
          <button
            onClick={() => {
              setSelectedTest(null);
              runBenchmark();
            }}
            disabled={isRunning}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              isRunning 
                ? 'bg-gray-200 text-gray-500'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isRunning ? 'Running...' : 'Run Benchmark'}
          </button>
        </div>

        {Object.entries(results).map(([name, result]) => (
          <div 
            key={name} 
            className={`mb-8 p-6 bg-white rounded-lg shadow-sm cursor-pointer transition-all ${
              selectedTest === name ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
            }`}
            onClick={() => runLiveComparison(name)}
          >
            <h2 className="text-xl font-semibold mb-4">{name}</h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">FastRender (WebAssembly)</p>
                <p className="text-2xl font-mono">{result.fastRender.toFixed(2)}ms</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Remark (JavaScript)</p>
                <p className="text-2xl font-mono">{result.remark.toFixed(2)}ms</p>
              </div>
            </div>
            <div className="mt-4">
              <p className={`text-lg font-semibold ${
                result.difference > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {result.difference > 0 
                  ? `${result.difference.toFixed(1)}% faster than Remark`
                  : `${-result.difference.toFixed(1)}% slower than Remark`}
              </p>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Average over 100 iterations
            </div>
          </div>
        ))}

        {selectedTest && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Live Comparison: {selectedTest}</h2>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="mb-4 p-2 bg-blue-50 rounded flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-blue-800">FastRender</h3>
                  <span className="text-sm text-blue-600">WebAssembly</span>
                </div>
                {liveContent.fastRender ? (
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: liveContent.fastRender }} 
                  />
                ) : (
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
              </div>
              
              <div>
                <div className="mb-4 p-2 bg-green-50 rounded flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-green-800">Remark</h3>
                  <span className="text-sm text-green-600">JavaScript</span>
                </div>
                {liveContent.remark ? (
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: liveContent.remark }} 
                  />
                ) : (
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
              </div>
            </div>
          </div>
        )}

        {Object.keys(results).length === 0 && !isRunning && !selectedTest && (
          <div className="text-center text-gray-500 py-12">
            Click "Run Benchmark" to see performance comparison
          </div>
        )}

        {isRunning && (
          <div className="text-center text-blue-500 py-12">
            Running benchmarks...
          </div>
        )}
      </div>
    </div>
  );
} 