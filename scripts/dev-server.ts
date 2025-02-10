import { serve } from "bun";

const projectRoot = import.meta.dir + "/..";

// Map virtual module paths to node_modules
const moduleAliases = {
  '/node_modules/': projectRoot + '/node_modules/',
};

serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;
    
    console.log('Serving:', path);
    
    // Serve index.html by default
    if (path === "/") {
      path = "/examples/index.html";
    }

    // Try to serve the file
    try {
      const file = Bun.file(projectRoot + path);
      // Set correct MIME types
      const mimeTypes = {
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.html': 'text/html',
        '.wasm': 'application/wasm',
      };
      const ext = path.split('.').pop() || '';
      const contentType = mimeTypes['.' + ext] || 'text/plain';
      
      return new Response(file, {
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cross-Origin-Embedder-Policy': 'require-corp'
        },
      });
    } catch (e) {
      console.error('Error serving file:', path, e);
      console.error(e.stack);
      return new Response(`Not Found: ${path}`, { status: 404 });
    }
  },
});

console.log("Server running at http://localhost:3000"); 