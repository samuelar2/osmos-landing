import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

const SITE = "https://meetosmos.com";

export default defineConfig({
  site: SITE,
  // Pages build to /faq.html, /help/x.html… and Cloudflare serves them at /faq, /help/x
  // (the same way /privacy.html is served at /privacy).
  trailingSlash: "never",
  build: {
    format: "file",
    // Inline the stylesheet: one less render-blocking request before the hero paints.
    inlineStylesheets: "always",
  },
  integrations: [
    sitemap({
      // The legal pages are static HTML in public/, so add them by hand.
      customPages: [`${SITE}/privacy`, `${SITE}/terms`],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
