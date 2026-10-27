# OBJY website artwork

## Original branding

The original assets are restored unchanged from the repository before the redesign (`e62ff79`):

| Current asset | Original path |
| --- | --- |
| `assets/site/logo.png` | `logo.png` |
| `assets/site/favicon.png` | `logo-sm.png` |

## Icon provenance and license review

Reviewed on 2026-10-27. This records the assets currently used by the site, rather than assigning a new license to the project.

| Assets | Origin and permissions |
| --- | --- |
| All six `assets/site/icons/*.svg` chapter icons | Custom SVG markup created by Codex for this website during this project. No downloaded icon pack, traced third-party artwork, or external icon font was used. There is no third-party icon license notice to carry over for these files. |
| The six larger `assets/site/*.svg` illustrations, including their small icon shapes | Custom SVG artwork introduced during this website rebuild. Repository history records their introduction in `ccede64`, `ae182bb`, `accb611`, and `eebdd01`; later commits refine these same assets. No external icon library or embedded third-party image is used. |
| `assets/site/branding/objy-db-mark-white.svg` and `.png` | Custom white-on-transparent OBJY DB mark created for this project. The PNG is a raster export of the matching SVG; neither includes third-party artwork. |
| `logo.png` and `favicon.png` | Existing OBJY brand assets restored byte-for-byte from `e62ff79`. The user confirmed in this project on 2026-10-27 that OBJY owns or has permission to use the existing logo and favicon. The original README references [OBJY's MIT license](https://github.com/objy-org/objy/blob/master/LICENSE.md); a copy of that notice is retained in `assets/vendor/objy.LICENSE`. |
| Logo displayed by the live server, client, and API documentation | Those three Markdown sources currently reference `https://raw.githubusercontent.com/spoo-technologies/objy-db/main/public/branding/objy-db-logo-signal.png`. The user confirmed rights to this OBJY DB logo on 2026-10-27. The source repository publishes an [MIT license](https://github.com/objy-org/objy.db/blob/main/LICENSE); its notice is retained in `assets/vendor/objy-db.LICENSE`. |

The old third-party-looking raster illustrations under the historical `icons/` folder are absent from this branch and are not used by the current site. Cloud providers and GitHub are linked by text, without their logos. Menu indicators and arrows use text/CSS shapes rather than an icon font. Montserrat's SIL Open Font License remains in `assets/site/montserrat-LICENSE.txt`.

No missing third-party icon attribution was found in this review. The brand-rights confirmation above comes from the user; repository history alone is not proof of ownership. Live documentation can change independently, so newly introduced remote images need their own provenance check.

## Header illustration

`assets/site/applications-objects.svg` uses a 720 × 480 canvas with an angled app window, a small team of AI agents, and an API endpoint surrounding floating JSON objects and an array. Sweeping arrows connect them. Gentle floating and flowing dotted paths add movement; the illustration stays still when reduced motion is preferred. It sits above the centered hero headline. Its Apps, AI agents, and APIs labels are editable in the Application diagram table in `content/<language>/labels.md`. The image path and alternative description are editable in `content/<language>/home.md`.

## Section illustrations

The documentation index uses three small line icons in `assets/site/icons/`: `server.svg` (stacked server units, coral), `client.svg` (a code window, lavender), and `api.svg` (connected endpoints, sage). Get started uses `quick-start.svg` (a terminal prompt, coral), `cloud.svg` (a cloud with an upload arrow, lavender), and `browser.svg` (a browser window with empty object braces, sage). They share a 48 × 48 canvas and rounded tile. Each is an ordinary Markdown image inside its chapter heading, with empty alternative text because the adjacent title provides the label. No icon library or page-specific JavaScript is needed.

The four feature illustrations share a 520 × 320 canvas and the site's coral, sage, and lavender palette:

- `assets/site/abstract-objects.svg`: a JSON object with an identity, color, availability, and an owner reference using the database’s actual reference format.
- `assets/site/simple-api.svg`: four large capability tiles in a two-by-two layout—Query, Vector, CRUD, and Aggregate—with prominent labels and icons around a small shared API connection.
- `assets/site/run-and-deploy.svg`: a browser window, a single server, and three connected servers; small arrows lead from one deployment size to the next.
- `assets/site/users-access.svg`: custom SVG artwork created for this site, showing user identities connected to a login lock and an access shield. No external icon library or third-party artwork is used; the picture has no embedded text to translate.

The feature grid covers API and JSON in its first row, then deployment and users/access in its second row. Each illustration sits beneath its explanation. Desktop and tablet use two columns; phones use one.

The storage section after the interactive object example extends `assets/site/storage-internals.svg` from `3f1a306` to a 660 × 740 canvas. A complete JSON object sits on the front plane, with hot fields, compact columns, and compressed fields on a rear plane. Persist and Recover arrows lead to a small cylinder labeled as optional S3 durability through journals and snapshots. This addition uses custom SVG geometry with no external icon artwork. All labels remain editable in the Storage diagram table.

The object example uses selectable Markdown chapters and code blocks in place of the former object-capabilities illustration. Its tab labels, source labels, and sample data are editable directly in `content/<language>/home.md`.

The JSON examples and storage labels are editable in the Object diagram and Storage diagram tables in `content/<language>/labels.md`. The API diagram table controls its operation labels. The deployment illustration uses only JSON braces and has no text labels. Paths and alternative descriptions live in `content/<language>/home.md`; layout and shapes remain developer concerns.
