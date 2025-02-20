import __wbg_init, { FastRenderCore } from '../pkg/fastrender.js';
import katex from 'katex';
import 'katex/dist/katex.min.css';

let Prism: any;
if (typeof window !== 'undefined') {
  // Only import Prism on the client side
  import('prismjs').then(module => {
    Prism = module.default;
    require('prismjs/themes/prism.css');
    require('prismjs/components/prism-typescript');
    require('prismjs/components/prism-rust');
    require('prismjs/components/prism-bash');
    require('prismjs/components/prism-json');
    require('prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard');
  });
}

export class FastRender {
  private core: FastRenderCore | null = null;
  private initialized = false;

  /**
   * Creates a new FastRender instance
   * @param options Configuration options
   */
  constructor(private options: {
    debug?: boolean;
    katexOptions?: katex.KatexOptions;
  } = {}) {}

  /**
   * Initializes the FastRender instance
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('Starting WASM initialization...');
    try {
      await __wbg_init();
      console.log('WASM initialized successfully');
      this.core = new FastRenderCore();
      console.log('FastRenderCore instance created');

      if (this.options.debug !== undefined) {
        this.core.set_debug(this.options.debug);
      }

      this.initialized = true;
      console.log('Initialization complete');
    } catch (error) {
      console.error('Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Renders markdown content to HTML
   * @param content Markdown string to render
   * @returns Promise resolving to rendered HTML
   */
  async renderMarkdown(content: string): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.core) {
      throw new Error('FastRender not properly initialized');
    }

    return this.core.render_markdown(content);
  }

  /**
   * Renders LaTeX content to HTML with better error handling
   */
  renderLatex(content: string, displayMode = false): string {
    try {
      content = content
        .replace(/&amp;/g, '&')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/\\text/g, '\\mathrm')
        // Handle vector calculus notation better
        .replace(/\\nabla\s*\\times/g, '\\nabla\\times')
        .replace(/\\nabla\s*\\cdot/g, '\\nabla\\cdot')
        // Handle partial derivatives better
        .replace(/\\partial\s*([^{])/g, '\\partial{$1}')
        .replace(/\\partial\{([^}]+)\}/g, '\\partial{$1}')
        // Handle subscripts better
        .replace(/_([a-zA-Z])/g, '_{$1}')
        .replace(/_\{([^}]+)\}/g, '_{$1}')
        // Handle superscripts better
        .replace(/\^([a-zA-Z0-9])/g, '^{$1}')
        .replace(/\^\{([^}]+)\}/g, '^{$1}');

      return katex.renderToString(content, {
        displayMode,
        throwOnError: false,
        trust: true,
        strict: false,
        macros: {
          '\\E': '\\mathrm{E}',
          '\\mc': '\\mathrm{mc}',
          '\\grad': '\\nabla',
          '\\div': '\\nabla \\cdot',
          '\\curl': '\\nabla \\times',
          '\\cross': '\\times',
          '\\hbar': '\\hslash',
          // Physics notation
          '\\mathbf': ['\\boldsymbol{#1}', 1],
          '\\vec': ['\\boldsymbol{#1}', 1],
          '\\tensor': ['\\boldsymbol{#1}', 1],
          // Common physics operators
          '\\Tr': '\\operatorname{Tr}',
          '\\Det': '\\operatorname{Det}',
          // Greek letters commonly used in physics
          '\\Alpha': 'A',
          '\\Beta': 'B',
          '\\Gamma': '\\Gamma',
          '\\Delta': '\\Delta',
          '\\Lambda': '\\Lambda',
          '\\Omega': '\\Omega',
          // Quantum mechanics
          '\\Psi': '\\psi',
          '\\bra': ['\\langle#1|', 1],
          '\\ket': ['|#1\\rangle', 1],
          '\\braket': ['\\langle#1|#2\\rangle', 2],
          // Statistical mechanics
          '\\avg': ['\\langle#1\\rangle', 1],
          // Common physics notation
          '\\dd': '\\mathrm{d}',
          '\\pdiff': ['\\frac{\\partial #1}{\\partial #2}', 2],
          '\\tdiff': ['\\frac{\\mathrm{d} #1}{\\mathrm{d} #2}', 2],
          // Additional physics macros
          '\\gamma': '\\gamma',
          '\\left': '\\left',
          '\\right': '\\right',
          '\\sin': '\\sin',
          '\\sqrt': '\\sqrt',
          // Special spacing
          '&=': '& =',
          '& =': '& =',
          // Common fractions
          '\\half': '\\frac{1}{2}',
          '\\third': '\\frac{1}{3}',
          '\\quarter': '\\frac{1}{4}',
          // Matrix environments
          '\\pmatrix': ['\\begin{pmatrix}#1\\end{pmatrix}', 1],
          // Vector calculus
          '\\divergence': '\\nabla \\cdot',
          '\\gradient': '\\nabla',
          // Partial derivatives
          '\\partial': '\\partial',
          '\\pdv': ['\\frac{\\partial #1}{\\partial #2}', 2],
          // Better fraction handling
          '\\frac': ['\\frac{#1}{#2}', 2],
          // Matrix delimiters
          '\\begin{pmatrix}': '\\begin{pmatrix}',
          '\\end{pmatrix}': '\\end{pmatrix}',
          // Vector calculus specific
          '\\cdot': '\\cdot',
          '\\times': '\\times',
          '\\nabla': '\\nabla',
          // Subscript handling
          '_x': '_{x}',
          '_y': '_{y}',
          '_z': '_{z}',
          // Partial derivative shortcuts
          '\\pdx': ['\\frac{\\partial #1}{\\partial x}', 1],
          '\\pdy': ['\\frac{\\partial #1}{\\partial y}', 1],
          '\\pdz': ['\\frac{\\partial #1}{\\partial z}', 1]
        },
        ...this.options.katexOptions
      });
    } catch (error) {
      console.warn('LaTeX rendering error:', error);
      return displayMode 
        ? `<div class="katex-fallback" style="text-align: center; padding: 1em;">${content}</div>`
        : `<span class="katex-fallback">${content}</span>`;
    }
  }

  /**
   * Renders mixed markdown and LaTeX content
   * @param content Mixed content to render
   * @returns Promise resolving to rendered HTML
   */
  async renderMixed(content: string): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.core) {
      throw new Error('FastRender not properly initialized');
    }

    // First render markdown
    let html = await this.core.render_markdown(content);

    // Then find and render LaTeX blocks
    html = await this.renderLatexBlocks(html);

    // Apply syntax highlighting to code blocks
    html = this.highlightCode(html);

    return html;
  }

  private async renderLatexBlocks(html: string): Promise<string> {
    // First decode HTML entities
    const decodeHTML = (str: string) => {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = str;
      return textarea.value;
    };
    
    html = decodeHTML(html);

    // Handle special LaTeX commands in text first
    html = html.replace(/\\nabla\\s*\\times\\s*\\mathbf\{([^}]+)\}/g, (match, content) => {
      return `\\(\\nabla \\times \\mathbf{${content}}\\)`;
    });

    // Handle pmatrix environments in square brackets
    html = html.replace(/\[.*?\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}.*?\]/g, (match) => {
      return `\\[${match.slice(1, -1)}\\]`;
    });

    // Handle \begin{aligned} in square brackets first
    html = html.replace(/\[\\begin\{aligned\}([\s\S]*?)\\end\{aligned\}\]/g, (match, content) => {
      const cleanContent = content
        .trim()
        .split('\\\\')
        .map(line => line.trim())
        .join(' \\\\ ');
      return `\\[\\begin{aligned}${cleanContent}\\end{aligned}\\]`;
    });

    // Handle square bracket equations first
    html = html.replace(/\[(.*?)\]/g, (match, content) => {
      if (content.includes('\\') || content.includes('_') || content.includes('^') || 
          content.includes('=') || content.includes('pmatrix')) {
        return `\\[${content}\\]`;
      }
      return match;
    });

    // Handle aligned equations first
    html = html.replace(/\\begin\{(aligned|equation\*?)\}([\s\S]*?)\\end\{\1\}/g, (match, env, content) => {
      const cleanContent = content
        .trim()
        .split('\\\\')
        .map(line => line.trim())
        .join(' \\\\ ');
      return `$$${cleanContent}$$`;
    });

    // Handle display math with proper newlines
    html = html.replace(/\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$/g, (match, tex1, tex2) => {
      const tex = (tex1 || tex2).trim();
      // Check if we need to wrap in aligned environment
      if ((tex.includes('\\\\') || tex.includes('&')) && !tex.includes('\\begin{aligned}')) {
        return this.renderLatex(`\\begin{aligned}${tex}\\end{aligned}`, true);
      }
      return this.renderLatex(tex, true);
    });

    // Handle inline math more carefully
    html = html.replace(/\\\((.*?)\\\)|\$([^$\n]+?)\$/g, (match, tex1, tex2) => {
      const tex = (tex1 || tex2).trim();
      return this.renderLatex(tex, false);
    });

    return html;
  }

  private highlightCode(html: string): string {
    if (!Prism) return html; // Return unhighlighted code if Prism isn't loaded
    // Rest of the highlighting logic...
    return html; // Placeholder return, actual implementation needed
  }
}

// Add a default export
export default FastRender;