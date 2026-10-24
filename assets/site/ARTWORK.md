# OBJY website artwork

## Original branding

The original assets are restored unchanged from the repository before the redesign (`e62ff79`):

| Current asset | Original path |
| --- | --- |
| `assets/site/logo.png` | `logo.png` |
| `assets/site/favicon.png` | `logo-sm.png` |

## Header illustration

`assets/site/header-objects.svg` shows three simple object cubes on a memory chip. It contains no text or code and sits above the centered headline. Its path and alternative description are editable in `content/home.md`.

## Section illustrations

Three native SVG illustrations use a consistent dark, coral, sage, and lavender palette:

- `assets/site/abstract-objects.svg`: identity, flexible properties, a reference, and optional hooks.
- `assets/site/storage-internals.svg`: two overlapping 3D planes: the intact JSON object sits in front of its storage internals, offset down and left. The rear plane shows only three broad storage tiers: hot fields, compact columns, and compressed fields. All three labels sit in the exposed right side, clear of the foreground object. Reads return the complete object.
- `assets/site/run-and-deploy.svg`: one node and a cluster with two shards and two replicas per shard.

These diagrams were authored as vector assets so their labels remain editable through the Markdown tables in `content/labels.md`. Their default labels also make each SVG understandable when viewed on its own. Paths and alternative descriptions live in `content/home.md`.
