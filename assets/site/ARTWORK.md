# OBJY website artwork

## Original branding

The original assets are restored unchanged from the repository before the redesign (`e62ff79`):

| Current asset | Original path |
| --- | --- |
| `assets/site/logo.png` | `logo.png` |
| `assets/site/favicon.png` | `logo-sm.png` |

## Header illustration

`assets/site/applications-objects.svg` uses a 720 × 480 canvas with an angled app window, a small team of AI agents, and an API endpoint surrounding floating JSON objects and an array. Sweeping arrows connect them. Gentle floating and flowing dotted paths add movement; the illustration stays still when reduced motion is preferred. It sits above the centered hero headline and description. Its Apps, AI agents, and APIs labels are editable in the Application diagram table in `content/labels.md`. The image path and alternative description are editable in `content/home.md`.

## Section illustrations

The three feature illustrations share a 520 × 320 canvas and the site's coral, sage, and lavender palette:

- `assets/site/abstract-objects.svg`: a JSON object with an identity, color, availability, and an owner reference using the database’s actual reference format.
- `assets/site/simple-api.svg`: one object API branching into four operations, illustrated by add/remove controls, a magnifying glass, aggregation bars, and neighboring vector points.
- `assets/site/run-and-deploy.svg`: a browser window, a single server, and three connected servers; small arrows lead from one deployment size to the next.

The full-width section restores `assets/site/storage-internals.svg` from `3f1a306`: a 660 × 570 illustration with a complete JSON object on the front plane and hot fields, compact columns, and compressed fields on a rear plane. Its larger presentation keeps both the JSON example and all three tiers readable.

The JSON examples and storage labels are editable in the Object diagram and Storage diagram tables in `content/labels.md`. The API diagram table controls its operation labels. The deployment illustration uses only JSON braces and has no text labels. Paths and alternative descriptions live in `content/home.md`; layout and shapes remain developer concerns.
