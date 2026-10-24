# OBJY website artwork

## Original branding

The original assets are restored unchanged from the repository before the redesign (`e62ff79`):

| Current asset | Original path |
| --- | --- |
| `assets/site/logo.png` | `logo.png` |
| `assets/site/favicon.png` | `logo-sm.png` |

## Header illustration

`assets/site/header-objects.svg` shows empty JSON objects and arrays floating among curved arrows, with no cards or backgrounds. Its only characters are curly braces and square brackets, and it sits above the centered headline. Its path and alternative description are editable in `content/home.md`.

## Section illustrations

The three feature illustrations share a 520 × 320 canvas and the site's coral, sage, and lavender palette:

- `assets/site/abstract-objects.svg`: a JSON object with an identity, color, availability, and an owner reference using the database’s actual reference format.
- `assets/site/runs-everywhere.svg`: a server cabinet, a browser window with JSON braces, and a cloud.
- `assets/site/run-and-deploy.svg`: three database silos connected in a cluster, without topology labels.

The full-width section restores `assets/site/storage-internals.svg` from `3f1a306`: a 660 × 570 illustration with a complete JSON object on the front plane and hot fields, compact columns, and compressed fields on a rear plane. Its larger presentation keeps both the JSON example and all three tiers readable.

The JSON examples and storage labels are editable in the Object diagram and Storage diagram tables in `content/labels.md`. The cluster illustration contains no text; the runtime illustration uses only JSON braces. Paths and alternative descriptions live in `content/home.md`; layout and shapes remain developer concerns.
