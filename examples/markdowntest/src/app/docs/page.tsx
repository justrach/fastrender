'use client';

import { useEffect, useState } from "react";
import FastRender from "fastrender";

const DOCS_CONTENT = `# FastRender Documentation

FastRender is a high-performance Markdown and LaTeX rendering library powered by WebAssembly.

## Installation

\`\`\`bash
npm install fastrender
\`\`\`

## Basic Usage

\`\`\`typescript
import FastRender from 'fastrender';

const renderer = new FastRender();
await renderer.initialize();

// Render markdown
const html = await renderer.renderMarkdown('# Hello World');

// Render mixed markdown and LaTeX
const mixed = await renderer.renderMixed('# Math Example: $E = mc^2$');
\`\`\`

## Features

- ⚡️ WebAssembly-powered for high performance
- 🧮 Native LaTeX support via KaTeX
- 🔄 Real-time rendering
- 📝 Full Markdown support
- 🎨 Customizable styling

## API Reference

### \`FastRender\` Class

#### Constructor Options

\`\`\`typescript
interface FastRenderOptions {
  debug?: boolean;
  katexOptions?: KatexOptions;
}
\`\`\`

#### Methods

- \`initialize()\`: Initialize the WebAssembly module
- \`renderMarkdown(content: string)\`: Render pure Markdown
- \`renderLatex(content: string, displayMode?: boolean)\`: Render LaTeX
- \`renderMixed(content: string)\`: Render Markdown with LaTeX
- \`clearCache()\`: Clear the render cache

## Examples

### Mixed Markdown and LaTeX

\`\`\`markdown
# Physics Equations

Einstein's famous equation: $E = mc^2$

Maxwell's equations in differential form:

$$
\\begin{align}
\\nabla \\cdot \\vec{\\mathbf{E}} &= \\frac{\\rho}{\\epsilon_0} \\\\
\\nabla \\cdot \\vec{\\mathbf{B}} &= 0 \\\\
\\nabla \\times \\vec{\\mathbf{E}} &= -\\frac{\\partial\\mathbf{B}}{\\partial t} \\\\
\\nabla \\times \\vec{\\mathbf{B}} &= \\mu_0\\vec{\\mathbf{J}} + \\mu_0\\epsilon_0\\frac{\\partial\\mathbf{E}}{\\partial t}
\\end{align}
$$
\`\`\`
`;

export default function DocsPage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const renderDocs = async () => {
      const renderer = new FastRender();
      await renderer.initialize();
      const rendered = await renderer.renderMixed(DOCS_CONTENT);
      setContent(rendered);
      setIsLoading(false);
    };

    renderDocs();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="animate-pulse">Loading documentation...</div>
        ) : (
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )}
      </div>
    </div>
  );
} 