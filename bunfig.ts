import { BunPlugin } from 'bun';

const cssPlugin: BunPlugin = {
  name: 'css',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const css = await Bun.file(args.path).text();
      return {
        exports: css,
        loader: 'text',
      };
    });
  },
};

export default {
  entrypoints: ['./src/fastrender.ts'],
  outdir: './dist',
  plugins: [cssPlugin],
  target: 'browser',
  splitting: true,
}; 