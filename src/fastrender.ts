import __wbg_init, { FastRenderCore } from '../pkg/fastrender.js';
import katex from 'katex';
import 'katex/dist/katex.min.css';

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
   * Renders LaTeX content to HTML
   * @param content LaTeX string to render
   * @param displayMode Optional override for math display mode
   * @returns HTML string
   */
  renderLatex(content: string, displayMode = false): string {
    return katex.renderToString(content, {
      displayMode,
      ...this.options.katexOptions
    });
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

    return html;
  }

  private async renderLatexBlocks(html: string): Promise<string> {
    // Replace $$ ... $$ blocks (display mode)
    html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => 
      this.renderLatex(tex, true)
    );

    // Replace $ ... $ blocks (inline mode)
    html = html.replace(/\$((?!\$).*?)\$/g, (_, tex) => 
      this.renderLatex(tex, false)
    );

    return html;
  }

  /**
   * Clears the render cache
   */
  clearCache(): void {
    this.core?.clear_cache();
  }
}

export default FastRender; 