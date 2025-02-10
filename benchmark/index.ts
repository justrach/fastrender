import FastRender from '../src/fastrender';
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

\`\`\`js
console.log('Hello World');
\`\`\`

## Section 2
More complex equations:
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

async function benchmarkFastRender(content: string, iterations: number = 100): Promise<number> {
  const renderer = new FastRender();
  
  // Warm up
  await renderer.renderMixed(content);
  
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    await renderer.renderMixed(content);
  }
  const end = performance.now();
  
  return (end - start) / iterations;
}

async function benchmarkRemark(content: string, iterations: number = 100): Promise<number> {
  // Warm up
  await remarkProcessor.process(content);
  
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    await remarkProcessor.process(content);
  }
  const end = performance.now();
  
  return (end - start) / iterations;
}

async function runBenchmarks() {
  console.log('Running benchmarks...\n');
  
  for (const [name, content] of Object.entries(TEST_CASES)) {
    console.log(`=== ${name} ===`);
    console.log(`Content length: ${content.length} characters`);
    
    const fastRenderTime = await benchmarkFastRender(content);
    const remarkTime = await benchmarkRemark(content);
    
    console.log(`FastRender: ${fastRenderTime.toFixed(2)}ms per iteration`);
    console.log(`Remark: ${remarkTime.toFixed(2)}ms per iteration`);
    console.log(`Difference: ${((remarkTime - fastRenderTime) / remarkTime * 100).toFixed(1)}% ${fastRenderTime < remarkTime ? 'faster' : 'slower'}\n`);
  }
}

runBenchmarks().catch(console.error); 