
import { defineConfig } from "vite";
import { nodeExternals } from "rollup-plugin-node-externals";

export default defineConfig({
  plugins: [nodeExternals()],
  build: {
    target: "node20",
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: () => "cli.js",
    },

    minify: "esbuild",

    rollupOptions: {
      output: {
        banner: "#!/usr/bin/env node",
      },
    },

    outDir: "dist",

    emptyOutDir: true,
  },
});