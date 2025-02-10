# fastrender

Real-time Markdown and LaTeX rendering library using WebAssembly.

## Features

- Fast Markdown rendering using WebAssembly
- LaTeX support via KaTeX
- Mixed content support (Markdown with inline and display LaTeX)
- Caching for improved performance
- TypeScript support

## Installation

```
npm install fastrender
# or
yarn add fastrender
# or
bun add fastrender
```

## Usage

```typescript
import fastrender from 'fastrender';

// Create an instance
const fastrender = new fastrender({
  debug: false,
  katexOptions: {
    throwOnError: false
  }
});

// Render Markdown
const markdown = await fastrender.renderMarkdown(`
# Hello World
This is **bold** text.
`);

// Render LaTeX
const latex = fastrender.renderLatex('\\frac{1}{2}');

// Render mixed content
const mixed = await fastrender.renderMixed(`
# Math Example
Here's an inline equation: $E = mc^2$

And a display equation:
$$
\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}
$$
`);
```

## API

### `new fastrender(options?)`

Creates a new fastrender instance.

Options:
- `debug?: boolean` - Enable debug mode
- `katexOptions?: KatexOptions` - KaTeX rendering options

### `renderMarkdown(content: string): Promise<string>`

Renders Markdown content to HTML.

### `renderLatex(content: string, displayMode?: boolean): string`

Renders LaTeX content to HTML.

### `renderMixed(content: string): Promise<string>`

Renders mixed Markdown and LaTeX content to HTML.

### `clearCache(): void`

Clears the internal render cache.

## Examples

### Pure Markdown

```typescript
const markdown = await fastrender.renderMarkdown(`
# Hello World
This is a **bold** statement.
`);
```

### Pure LaTeX

```typescript
const latex = fastrender.renderLatex('\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}', true);
```

### Mixed Content

```typescript
const mixed = await fastrender.renderMixed(`
# Math and Text Combined

Here's the quadratic formula: $ax^2 + bx + c = 0$

The solution is:

$$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$

And here's Einstein's famous equation: $E = mc^2$
`);
```

## Development

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Run tests
bun run test

# Run benchmarks
bun run benchmark
```

## License

MIT 