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

export function resolveRelativeLinks(markdown, baseUrl) {
  return markdown.replace(
    /(!?\[[^\]]*\])\(([^)\s]+)(\s+"[^"]*")?\)/g,
    (match, label, url, title = "") => {
      if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(url)) return match;
      try {
        return `${label}(${new URL(url, baseUrl).href}${title})`;
      } catch {
        return match;
      }
    },
  );
}
