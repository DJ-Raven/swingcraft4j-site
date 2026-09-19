import { Marked } from "marked";
import { codeToHtml } from "shiki";

const shikiThemes = { light: "github-light", dark: "github-dark" };

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\- ]+/g, "").replace(/ /g, "-");
}

function addHeadingIds(html, idPrefix = "") {
  const slugCounts = new Map();
  const ids = new Set();
  const withIds = html.replace(/<h([1-6])>([\s\S]*?)<\/h\1>/g, (match, level, inner) => {
    const slug = slugify(inner.replace(/<[^>]+>/g, ""));
    const count = slugCounts.get(slug) || 0;
    slugCounts.set(slug, count + 1);
    const id = count ? `${slug}-${count}` : slug;
    ids.add(id);
    return `<h${level} id="${idPrefix}${id}">${inner}</h${level}>`;
  });
  // Only links to this doc's own headings get the prefix; links already aimed at another tab keep theirs.
  return idPrefix
    ? withIds.replace(/(<a href=")#([^"]*)"/g, (match, open, id) => (ids.has(id) ? `${open}#${idPrefix}${id}"` : match))
    : withIds;
}

function wrapTables(html) {
  return html
    .replace(/<table>[\s\S]*?<\/table>/g, (table) => table.replace(/<code>([\s\S]*?)<\/code>/g, (_, code) => `<code>${code.replace(/\(/g, "(<wbr>")}</code>`))
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, "</table></div>");
}

export async function renderMarkdown(markdown, { idPrefix = "" } = {}) {
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
  return wrapTables(addHeadingIds(html, idPrefix));
}
