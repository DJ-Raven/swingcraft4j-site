#!/usr/bin/env node
// Fetches public GitHub Sponsors for GITHUB_SPONSORS_LOGIN and writes src/data/sponsors.json.
// Requires GH_SPONSORS_TOKEN (a GitHub token with at least `read:user` scope) in the environment.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const login = process.env.GITHUB_SPONSORS_LOGIN || "DJ-Raven";
const token = process.env.GH_SPONSORS_TOKEN;

if (!token) {
  console.error("Missing GH_SPONSORS_TOKEN environment variable.");
  console.error('Set it to a GitHub token with "read:user" scope, then re-run this script.');
  process.exit(1);
}

const query = `
  query($login: String!) {
    user(login: $login) {
      sponsorshipsAsMaintainer(first: 100, includePrivate: false, orderBy: {field: CREATED_AT, direction: DESC}) {
        nodes {
          privacyLevel
          sponsorEntity {
            __typename
            ... on User { login url avatarUrl }
            ... on Organization { login url avatarUrl }
          }
        }
      }
    }
  }
`;

const response = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: {
    Authorization: `bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query, variables: { login } }),
});

if (!response.ok) {
  console.error(`GitHub API request failed: ${response.status} ${response.statusText}`);
  process.exit(1);
}

const json = await response.json();
if (json.errors) {
  console.error("GitHub API returned errors:", JSON.stringify(json.errors, null, 2));
  process.exit(1);
}

const nodes = json.data?.user?.sponsorshipsAsMaintainer?.nodes ?? [];
const current = nodes
  .filter((node) => node.privacyLevel === "PUBLIC" && node.sponsorEntity)
  .map((node) => ({
    name: node.sponsorEntity.login,
    github: node.sponsorEntity.url,
    avatar: node.sponsorEntity.avatarUrl,
  }));

const dataPath = fileURLToPath(new URL("../src/data/sponsors.json", import.meta.url));
const existing = JSON.parse(readFileSync(dataPath, "utf-8"));
const currentLogins = new Set(current.map((s) => s.name));

const past = new Map();
for (const s of [...(existing.current ?? []), ...(existing.past ?? [])]) {
  if (!currentLogins.has(s.name)) past.set(s.name, s);
}

const result = { current, past: [...past.values()] };
writeFileSync(dataPath, JSON.stringify(result, null, 2) + "\n");
console.log(`Updated sponsors.json — ${result.current.length} current, ${result.past.length} past sponsor(s).`);
