# OBJY website artwork

## Original branding and header

The original assets are restored unchanged from the repository before the redesign (`e62ff79`):

| Current asset | Original path |
| --- | --- |
| `assets/site/logo.png` | `logo.png` |
| `assets/site/favicon.png` | `logo-sm.png` |
| `assets/site/header-objects.png` | `assets/img/OBJY-object-code.png` |

The header image is the original cube-and-code illustration, retained as artwork rather than a current API example. Its path and alternative description are editable in `content/home.md`.

## Section illustrations

Three native SVG illustrations use a consistent dark, coral, sage, and lavender palette:

- `assets/site/abstract-objects.svg`: identity, flexible properties, a reference, and optional hooks.
- `assets/site/storage-internals.svg`: hot fields, columns, and compressed fields in RAM, plus optional local WAL and S3 persistence.
- `assets/site/run-and-deploy.svg`: one node and a cluster with two shards and two replicas per shard.

These diagrams were authored as vector assets so their labels remain editable through the Markdown tables in `content/labels.md`. Their default labels also make each SVG understandable when viewed on its own. Paths and alternative descriptions live in `content/home.md`.
