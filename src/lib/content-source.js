import contentSources from "../data/content-sources.json";

export function remoteAssetUrl(slug, filename) {
  return `https://raw.githubusercontent.com/${contentSources.repo}/${contentSources.branch}/${slug}/${filename}`;
}

export function remoteDocUrl(repoUrl, path, branch = "main") {
  const match = repoUrl.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/,
  );
  if (!match) return null;
  const [, owner, repo] = match;
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path.replace(/^\/+/, "")}`;
}

// docTabs maps a sibling doc's raw URL to its tab id, so links between docs of
// one project become in-page tab links ("#tab--heading") instead of raw URLs.
export function resolveRelativeLinks(markdown, baseUrl, docTabs = new Map()) {
  return markdown.replace(
    /(!?\[[^\]]*\])\(([^)\s]+)(\s+"[^"]*")?\)/g,
    (match, label, url, title = "") => {
      if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(url)) return match;
      try {
        const resolved = new URL(url, baseUrl);
        const tab = docTabs.get(resolved.origin + resolved.pathname);
        if (tab && !label.startsWith("!")) {
          return `${label}(#${tab}${resolved.hash ? `--${resolved.hash.slice(1)}` : ""}${title})`;
        }
        return `${label}(${resolved.href}${title})`;
      } catch {
        return match;
      }
    },
  );
}
