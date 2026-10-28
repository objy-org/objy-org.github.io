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
| The larger `assets/site/*.svg` illustrations, including their small icon shapes | Custom SVG artwork introduced during this website rebuild. Repository history records their introduction in `ccede64`, `ae182bb`, `accb611`, and `eebdd01`; later commits refine these same assets. No external icon library or embedded third-party image is used. |
| `assets/site/branding/objy-db-mark-white.svg` and `.png` | Custom white-on-transparent OBJY DB mark created for this project. The PNG is a raster export of the matching SVG; neither includes third-party artwork. |
| `logo.png` and `favicon.png` | Existing OBJY brand assets restored byte-for-byte from `e62ff79`. The user confirmed in this project on 2026-10-27 that OBJY owns or has permission to use the existing logo and favicon. The original README references [OBJY's MIT license](https://github.com/objy-org/objy/blob/master/LICENSE.md); a copy of that notice is retained in `assets/vendor/objy.LICENSE`. |
| Logo displayed by the live server, client, and API documentation | Those three Markdown sources currently reference `https://raw.githubusercontent.com/spoo-technologies/objy-db/main/public/branding/objy-db-logo-signal.png`. The user confirmed rights to this OBJY DB logo on 2026-10-27. The source repository publishes an [MIT license](https://github.com/objy-org/objy.db/blob/main/LICENSE); its notice is retained in `assets/vendor/objy-db.LICENSE`. |

The old third-party-looking raster illustrations under the historical `icons/` folder are absent from this branch and are not used by the current site. Cloud providers and GitHub are linked by text, without their logos. Menu indicators and arrows use text/CSS shapes rather than an icon font. Montserrat's SIL Open Font License remains in `assets/site/montserrat-LICENSE.txt`.

No missing third-party icon attribution was found in this review. The brand-rights confirmation above comes from the user; repository history alone is not proof of ownership. Live documentation can change independently, so newly introduced remote images need their own provenance check.

## Header illustration

`assets/site/applications-objects.svg` uses a 720 × 480 canvas with an angled app window, a small team of AI agents, and an API endpoint surrounding floating JSON objects and an array. Sweeping arrows connect them. Gentle floating and flowing dotted paths add movement; the illustration stays still when reduced motion is preferred. It sits above the centered hero headline. Its Apps, AI agents, and APIs labels are editable in the Application diagram table in `content/<language>/labels.md`. The image path and alternative description are editable in `content/<language>/home.md`.

## Section illustrations

The documentation index uses three small line icons in `assets/site/icons/`: `server.svg` (stacked server units, coral), `client.svg` (a code window, lavender), and `api.svg` (connected endpoints, sage). Get started uses `quick-start.svg` (a terminal prompt, coral), `cloud.svg` (a cloud with an upload arrow, lavender), and `browser.svg` (a browser window with empty object braces, sage). They share a 48 × 48 canvas and rounded tile. Each is an ordinary Markdown image inside its chapter heading, with empty alternative text because the adjacent title provides the label. No icon library or page-specific JavaScript is needed.

The overview uses one shared illustration, `assets/site/abstract-objects.svg`, with a 520 × 440 canvas. The parent device is shown as a read response, including the resolved person inside `operator.object`. A gray person beside it represents the live source. An arrow points from that source into the expanded view, and the caption explains that it is resolved rather than copied. Four smaller arrows extend into the surrounding callouts for object features, the API, users/access, and deployment. The artwork keeps the site’s coral, sage, and lavender palette and uses only custom SVG geometry.

The callout headings and explanations are ordinary `###` chapters in each language’s `home.md`. The homepage renderer places them around the image on desktop and below it on narrow screens, hiding only the side connectors. The JSON fields, collection names, read-view label, source label, and resolution caption remain editable in the Object diagram table in `labels.md`. The API and users/access callouts include small Markdown JSON previews for a query and a permission rule. Alternative text and the image path remain in `home.md`.

The storage section after the interactive object example extends `assets/site/storage-internals.svg` from `3f1a306` to a 660 × 740 canvas. A complete JSON object sits on the front plane, with hot fields, compact columns, and compressed fields on a rear plane. Persist and Recover arrows lead to a small cylinder labeled as optional S3 durability through journals and snapshots. This addition uses custom SVG geometry with no external icon artwork. All labels remain editable in the Storage diagram table.

The object example uses selectable Markdown chapters and code blocks in place of the former object-capabilities illustration. Its tab labels, source labels, and sample data are editable directly in `content/<language>/home.md`.

The JSON examples and storage labels are editable in the Object diagram and Storage diagram tables in `content/<language>/labels.md`. The overview’s API and deployment explanations are ordinary Markdown callouts in `home.md`. Paths and alternative descriptions live in `content/<language>/home.md`; layout and shapes remain developer concerns.
