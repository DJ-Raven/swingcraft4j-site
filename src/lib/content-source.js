import contentSources from "../data/content-sources.json";

export function remoteAssetUrl(slug, filename) {
  return `https://raw.githubusercontent.com/${contentSources.repo}/${contentSources.branch}/${slug}/${filename}`;
}
