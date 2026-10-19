// @ts-check
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

import react from "@astrojs/react";
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),
  security: {
    checkOrigin: false,
    actionBodySizeLimit: 20 * 1024 * 1024,
  },

  integrations: [react()],

  vite: {
    optimizeDeps: {
      include: ["react-dom/client"],
    },
    build: {
      commonjsOptions: {
        include: [/react-dom\/client/, /node_modules/],
      },
    },
    // @ts-ignore
    plugins: [tailwindcss()],
  },
});
