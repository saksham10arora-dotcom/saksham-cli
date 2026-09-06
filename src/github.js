"use strict";
/* Live profile data, unauthenticated. Every failure path returns null so the
   card still renders offline, behind a proxy, or once the 60-req/hr
   anonymous rate limit is hit. */
const USER = "saksham10arora-dotcom";

async function fetchStats(timeoutMs = 2800) {
  const opts = {
    headers: { "user-agent": "saksham-arora-cli", accept: "application/vnd.github+json" },
    signal: AbortSignal.timeout(timeoutMs),
  };
  try {
    const [user, repos] = await Promise.all([
      fetch(`https://api.github.com/users/${USER}`, opts).then((r) => (r.ok ? r.json() : null)),
      fetch(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=10`, opts)
        .then((r) => (r.ok ? r.json() : null)),
    ]);
    if (!user && !repos) return null;
    const recent = Array.isArray(repos)
      ? repos.filter((r) => !r.fork).slice(0, 4).map((r) => ({
          name: r.name,
          desc: (r.description || "").trim(),
          pushed: r.pushed_at,
          stars: r.stargazers_count,
        }))
      : [];
    return {
      repos: user ? user.public_repos : null,
      followers: user ? user.followers : null,
      recent,
    };
  } catch {
    return null;
  }
}

module.exports = { fetchStats, USER };
