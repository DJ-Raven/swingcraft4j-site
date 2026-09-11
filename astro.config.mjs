import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.swingcraft4j.com",
  base: "/",
  integrations: [sitemap()]
});