# Self-hosted fonts

Loaded with `next/font/local` in `src/components/LocaleDocument.tsx` and exposed
as CSS variables. Only the weights the pages actually render are here.

| Family | Weights | Variable | Source | License |
|---|---|---|---|---|
| General Sans | 500, 600, 700 | `--font-general-sans` | Fontshare | ITF Free Font License (free for commercial use, self-hosting allowed) |
| Satoshi | 400, 500, 700 | `--font-satoshi` | Fontshare | ITF Free Font License |
| JetBrains Mono | 400, 500, 600, 700 | `--font-jetbrains-mono` | Fontshare | SIL Open Font License 1.1 |

To add a weight: download its `.woff2` from fontshare.com, put it here, and add
it to the matching `localFont({ src: [...] })` list.
