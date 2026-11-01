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
| All seven `assets/site/icons/*.svg` chapter icons | Custom SVG markup created by Codex for this website during this project. No downloaded icon pack, traced third-party artwork, or external icon font was used. There is no third-party icon license notice to carry over for these files. |
| All 21 `assets/site/icons/features/*.svg` catalog icons | Custom SVG geometry created for the feature catalog on 2026-10-31. Each capability has a distinct drawing in the site's coral, lavender, blue, or sage palette. No external artwork, icon font, or third-party icon library is used. |
| All four `assets/site/icons/use-cases/*.svg` homepage icons | Custom SVG geometry created for this website on 2026-10-31 in the existing coral, lavender, blue, and sage palette. No downloaded artwork, icon font, or third-party library is used. |
| `assets/site/architecture.svg` | Custom SVG geometry created for the architecture overview on 2026-10-31. No downloaded icons, external artwork, or third-party icon library is used. |
| `assets/site/applications-objects.svg` | Custom SVG artwork revised on 2026-10-31 from the earlier apps-and-objects composition. A dominant layered object database connects to smaller application, agent, API, and object-node drawings. No external icon library or third-party artwork is used. |
| `assets/site/branding/objy-db-mark-white.svg` and `.png` | Custom white-on-transparent OBJY DB mark created for this project. The PNG is a raster export of the matching SVG; neither includes third-party artwork. |
| `logo.png` and `favicon.png` | Existing OBJY brand assets restored byte-for-byte from `e62ff79`. The user confirmed in this project on 2026-10-27 that OBJY owns or has permission to use the existing logo and favicon. The original README references [OBJY's MIT license](https://github.com/objy-org/objy/blob/master/LICENSE.md); a copy of that notice is retained in `assets/vendor/objy.LICENSE`. |
| Artwork displayed by live documentation | The main README currently references `https://raw.githubusercontent.com/objy-org/objy/main/public/branding/objy-db-header-deep-field.png`. The user confirmed rights to the existing OBJY branding on 2026-10-27. The source repository publishes an [MIT license](https://github.com/objy-org/objy/blob/main/LICENSE) and a [brand notice](https://github.com/objy-org/objy/blob/main/NOTICE.md). The earlier source license notice remains in `assets/vendor/objy-db.LICENSE`. |

The old third-party-looking raster illustrations under the historical `icons/` folder are absent from this branch and are not used by the current site. Cloud providers and GitHub are linked by text, without their logos. Menu indicators and arrows use text/CSS shapes rather than an icon font. Montserrat's SIL Open Font License remains in `assets/site/montserrat-LICENSE.txt`.

No missing third-party icon attribution was found in this review. The brand-rights confirmation above comes from the user; repository history alone is not proof of ownership. Live documentation can change independently, so newly introduced remote images need their own provenance check.

## Homepage hero

`assets/site/applications-objects.svg` puts a large, layered OBJY object database at the center. Its JSON shows an ID, a name, an array, and a vector. Smaller app, agent, and API icons connect through precise paths; two quieter object nodes suggest scale. The existing coral, lavender, blue, and sage palette remains, with restrained perspective and moving connection pulses. Reduced-motion preferences hide the pulses.

The SVG shares its geometry and translated text between a 720 × 480 desktop layout and a 420 × 560 phone layout. The phone composition keeps the database large and places endpoints beneath it. The hero remains capped at 1300px. Labels and JSON lines come from the Application diagram table in each language’s `labels.md`; its image path and accessible description live in `home.md`. The previous illustration remains available in Git history.

## Architecture illustration

`assets/site/architecture.svg` introduces the homepage Features area beneath its title, without an Architecture heading. Four API options (CRUD, Query, Aggregate, and Vector) connect to one small bike JSON example. Below it, a physical RAM module has a keyed circuit board, gold contacts, and three chips labeled Hot fields, Columns, and Compressed. The old overlapping cards and internal explanation lines have been removed.

The SVG uses a 1000 × 570 wide layout and a 360 × 600 phone layout below 641px, capped at 900px on the page. Both reuse one JSON card and the same custom API glyphs. API labels and JSON lines live in the Architecture diagram table in each language’s `labels.md`; the short Storage diagram labels are shared with Learn. The image path and screen-reader description live in `home.md`. A small Markdown caption beneath the image explains the storage. All geometry is original SVG markup; no third-party artwork was introduced.

## Page icons and use cases

The documentation index and deployment page retain their custom SVG icons in `assets/site/icons/`. The homepage feature catalog uses 21 distinct icons in `assets/site/icons/features/`. Their provenance is recorded above.

The homepage uses four custom icons for AI agents and memory, analytics, application backends, and an open-ended “Or anything else…” option. Its headings, icon paths, and descriptions stay editable in `content/<language>/home.md`. The complete catalog below the use cases uses all 21 feature icons. Its combined overview and feature entries live together in the localized homepage Markdown, with their existing short descriptions and no code examples.

## Storage explanation

The former stacked storage illustration and the more detailed architecture panel remain available in Git history. The current architecture drawing uses a physical RAM module with only three short chip labels and an in-memory heading. These are editable in the localized Storage diagram tables in `labels.md`, shared with the Learn illustrations. The detailed explanations remain on Learn and in the feature cards.

## Learn illustrations

The eight SVGs in `assets/site/learn/` were created for this website on 2026-11-01 with original vector geometry, without third-party icons or images. `objects.svg` shows a bike as valid JSON; `references.svg` connects it to its owner Alex and shows the resolved `owner.object.name`; `collections.svg` introduces shared collection settings; `apis.svg` connects CRUD, queries, aggregation, and vectors to the same bike; `memory.svg` places three storage blocks inside RAM. `server.svg` shows the API and authentication layer in front of the same database engine; `cluster.svg` distinguishes distributing shards from keeping replicas on other nodes.

They are referenced by each language’s `learn.md`, which supplies accessible descriptions and organizes the guide into Database and Server chapters. Diagram labels use the existing Architecture and Storage tables plus the Learn diagrams table in `labels.md`. JSON lines, identifiers, and example names are also editable in that table; keep the sample data consistent across languages. Seven illustrations include separate narrow-screen layouts so labels remain readable on phones. The illustrations load only on pages that reference them.

`vectors.svg` adds an original HNSW illustration: sparse upper graph layers, denser lower connections, and a highlighted search path ending at similar bikes. It uses the existing lavender, coral, blue, and sage palette, with a dedicated phone composition. Its graph is a schematic rather than a projection of the example embedding. The geometry is original; algorithm descriptions were checked against [the HNSW paper](https://arxiv.org/abs/1603.09320), and the API example against OBJY’s current documentation and local engine.
