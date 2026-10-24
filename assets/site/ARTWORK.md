# OBJY website artwork

## Original branding

The original assets are restored unchanged from the repository before the redesign (`e62ff79`):

| Current asset | Original path |
| --- | --- |
| `assets/site/logo.png` | `logo.png` |
| `assets/site/favicon.png` | `logo-sm.png` |

## Header illustration

`assets/site/applications-objects.svg` uses a 720 × 480 canvas with an angled app window, a small team of AI agents, and an API endpoint surrounding floating JSON objects and an array. Sweeping arrows connect them. Gentle floating and flowing dotted paths add movement; the illustration stays still when reduced motion is preferred. It sits above the centered hero headline. Its Apps, AI agents, and APIs labels are editable in the Application diagram table in `content/labels.md`. The image path and alternative description are editable in `content/home.md`.

## Section illustrations

The three feature illustrations share a 520 × 320 canvas and the site's coral, sage, and lavender palette:

- `assets/site/abstract-objects.svg`: a JSON object with an identity, color, availability, and an owner reference using the database’s actual reference format.
- `assets/site/simple-api.svg`: four large capability tiles in a two-by-two layout—Query, Vector, CRUD, and Aggregate—with prominent labels and icons around a small shared API connection.
- `assets/site/run-and-deploy.svg`: a browser window, a single server, and three connected servers; small arrows lead from one deployment size to the next.

The feature row places the API on the left, JSON in the center, and deployment on the right. A decorative SVG overlay places short curved arrows in the gaps, pointing toward the JSON object. The `data-connection-left` and `data-connection-right` coordinates identify visible artwork edges so the arrows stay clear of the drawings. Arrows follow the layout as it resizes and are hidden when the columns stack. Replacement images without coordinates use their outer edges.

The full-width section restores `assets/site/storage-internals.svg` from `3f1a306`: a 660 × 570 illustration with a complete JSON object on the front plane and hot fields, compact columns, and compressed fields on a rear plane. Its larger presentation keeps both the JSON example and all three tiers readable.

`assets/site/object-capabilities.svg` follows in the “Objects that do more” section. A new field floats into a JSON object, a curved reference leads to a separate user object, and a shield represents read/write access. The 720 × 560 illustration uses the same coral, sage, and lavender palette. Its labels and JSON fragments live in the Capabilities diagram table in `content/labels.md`. The section places its image on the left on desktop and after the copy on smaller screens.

The JSON examples and storage labels are editable in the Object diagram and Storage diagram tables in `content/labels.md`. The API diagram table controls its operation labels. The deployment illustration uses only JSON braces and has no text labels. Paths and alternative descriptions live in `content/home.md`; layout and shapes remain developer concerns.
