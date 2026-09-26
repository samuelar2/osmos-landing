import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://meetosmos.com",
  // Inline the stylesheet: one less render-blocking request before the hero paints.
  build: { inlineStylesheets: "always" },
  vite: {
    plugins: [tailwindcss()],
  },
});
