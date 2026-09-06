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
    const user = await fetch(`https://api.github.com/users/${USER}`, opts)
      .then((r) => (r.ok ? r.json() : null));
    if (!user) return null;
    return { repos: user.public_repos, followers: user.followers };
  } catch {
    return null;
  }
}

module.exports = { fetchStats, USER };
