import { Marked } from "marked";
import { codeToHtml } from "shiki";

const shikiThemes = { light: "github-light", dark: "github-dark" };

export async function renderMarkdown(markdown) {
  const codeBlocks = [];
  const marked = new Marked({
    renderer: {
      code({ text, lang }) {
        const index = codeBlocks.length;
        codeBlocks.push({ code: text, lang: (lang || "").split(" ")[0] || "text" });
        return `<!--code-block-${index}-->`;
      },
    },
  });
  let html = await marked.parse(markdown);
  for (let i = 0; i < codeBlocks.length; i++) {
    const { code, lang } = codeBlocks[i];
    let highlighted;
    try {
      highlighted = await codeToHtml(code, { lang, themes: shikiThemes, defaultColor: false });
    } catch {
      highlighted = await codeToHtml(code, { lang: "text", themes: shikiThemes, defaultColor: false });
    }
    html = html.replace(`<!--code-block-${i}-->`, highlighted);
  }
  return html;
}
