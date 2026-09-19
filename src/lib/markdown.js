import { Marked } from "marked";
import { codeToHtml } from "shiki";

const shikiThemes = { light: "github-light", dark: "github-dark" };

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\- ]+/g, "").replace(/ /g, "-");
}

function addHeadingIds(html) {
  const slugCounts = new Map();
  return html.replace(/<h([1-6])>([\s\S]*?)<\/h\1>/g, (match, level, inner) => {
    const slug = slugify(inner.replace(/<[^>]+>/g, ""));
    const count = slugCounts.get(slug) || 0;
    slugCounts.set(slug, count + 1);
    return `<h${level} id="${count ? `${slug}-${count}` : slug}">${inner}</h${level}>`;
  });
}

function wrapTables(html) {
  return html
    .replace(/<table>[\s\S]*?<\/table>/g, (table) => table.replace(/<code>([\s\S]*?)<\/code>/g, (_, code) => `<code>${code.replace(/\(/g, "(<wbr>")}</code>`))
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, "</table></div>");
}

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
  return wrapTables(addHeadingIds(html));
}
