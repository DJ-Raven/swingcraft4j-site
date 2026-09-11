import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://dj-raven.github.io",
  base: "/",
  integrations: [sitemap()]
});