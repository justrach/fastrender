import Quokka from '../dist/quokka.js';

async function example() {
  // Create a new instance
  const quokka = new Quokka({
    debug: true,
    katexOptions: {
      throwOnError: false,
      strict: false
    }
  });

  // Render some markdown
  const markdown = await quokka.renderMarkdown(`
    # Hello World
    
    This is a **bold** statement.
  `);
  console.log(markdown);

  // Render some LaTeX
  const latex = quokka.renderLatex('\\frac{1}{2}');
  console.log(latex);

  // Render mixed content
  const mixed = await quokka.renderMixed(`
    # Math Example
    
    Here's an inline equation: $E = mc^2$
    
    And a display equation:
    
    $$
    \\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
    $$
  `);
  console.log(mixed);
}

example().catch(console.error); 