declare module 'fastrender' {
  import { KatexOptions } from 'katex';

  export interface FastRenderCore {
    render_markdown(content: string): string;
    clear_cache(): void;
    set_debug(debug: boolean): void;
  }

  export interface FastRenderOptions {
    debug?: boolean;
    katexOptions?: KatexOptions;
  }

  export class FastRender {
    constructor(options?: FastRenderOptions);
    
    initialize(): Promise<void>;
    
    renderMarkdown(content: string): Promise<string>;
    
    renderLatex(content: string, displayMode?: boolean): string;
    
    renderMixed(content: string): Promise<string>;
    
    clearCache(): void;
  }

  export default FastRender;
} 