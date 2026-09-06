# saksham-arora

My calling card, in your terminal.

```bash
npx saksham-arora
```

ASCII rain condenses into the wordmark, then an interactive card opens: arrow
keys to move, enter to open a link in your browser, `q` to leave. Recent
repositories and follower counts are fetched live from the GitHub API at run
time, so the card is never stale.

There is one thing hidden behind `g`.

## Flags

| flag | what it does |
|:--|:--|
| `--no-anim` | skip the intro |
| `--no-color` | plain text, no escape codes |
| `-v`, `--version` | print the version |
| `-h`, `--help` | usage |

Piping or redirecting the output prints a plain static card instead of the
interactive one, so `npx saksham-arora > card.txt` gives you something
readable. `NO_COLOR` is respected.

## Notes

Zero dependencies, so `npx` stays fast. Needs Node 18 or newer for the
built-in `fetch`. Every network path fails soft: no connection, a proxy, or
GitHub's anonymous rate limit just means the card renders without the live
section.

[saksham.digital](https://saksham.digital) · MIT
