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
| `assets/site/storage-internals.svg` | Restored byte-for-byte from `ff07780`. Custom OBJY website SVG based on the earlier stacked storage sketch, with an optional S3 durability layer. No external icon library or third-party artwork is used. |
| `assets/site/branding/objy-db-mark-white.svg` and `.png` | Custom white-on-transparent OBJY DB mark created for this project. The PNG is a raster export of the matching SVG; neither includes third-party artwork. |
| `logo.png` and `favicon.png` | Existing OBJY brand assets restored byte-for-byte from `e62ff79`. The user confirmed in this project on 2026-10-27 that OBJY owns or has permission to use the existing logo and favicon. The original README references [OBJY's MIT license](https://github.com/objy-org/objy/blob/master/LICENSE.md); a copy of that notice is retained in `assets/vendor/objy.LICENSE`. |
| Artwork displayed by live documentation | The main README currently references `https://raw.githubusercontent.com/objy-org/objy/main/public/branding/objy-db-header-deep-field.png`. The user confirmed rights to the existing OBJY branding on 2026-10-27. The source repository publishes an [MIT license](https://github.com/objy-org/objy/blob/main/LICENSE) and a [brand notice](https://github.com/objy-org/objy/blob/main/NOTICE.md). The earlier source license notice remains in `assets/vendor/objy-db.LICENSE`. |

The old third-party-looking raster illustrations under the historical `icons/` folder are absent from this branch and are not used by the current site. Cloud providers and GitHub are linked by text, without their logos. Menu indicators and arrows use text/CSS shapes rather than an icon font. Montserrat's SIL Open Font License remains in `assets/site/montserrat-LICENSE.txt`.

No missing third-party icon attribution was found in this review. The brand-rights confirmation above comes from the user; repository history alone is not proof of ownership. Live documentation can change independently, so newly introduced remote images need their own provenance check.

## Homepage hero

`assets/site/applications-objects.svg` puts a large, layered OBJY object database at the center. Its JSON shows an ID, a name, an array, and a vector. Smaller app, agent, and API icons connect through precise paths; two quieter object nodes suggest scale. The existing coral, lavender, blue, and sage palette remains, with restrained perspective and moving connection pulses. Reduced-motion preferences hide the pulses.

The SVG shares its geometry and translated text between a 720 × 480 desktop layout and a 420 × 560 phone layout. The phone composition keeps the database large and places endpoints beneath it. The hero remains capped at 1300px. Labels and JSON lines come from the Application diagram table in each language’s `labels.md`; its image path and accessible description live in `home.md`. The previous illustration remains available in Git history.

## Architecture illustration

`assets/site/architecture.svg` is now the first section on the Features page. CRUD, Query, Aggregate, and Vector appear above three overlapping JSON cards: a person, an AI memory with a vector, and a connected device. The tilted cards retain their existing geometry, without storage internals or a durability panel.

The SVG uses a wide 1000 × 680 composition and a vertical phone composition of 360 × 700 below 641px. Both reuse the same card frame and three snippet definitions. The overlaps sit at card edges so the JSON stays readable. All labels and JSON lines are supplied by the Architecture diagram table in each language’s `labels.md`. The image path and screen-reader description live in `features.md`. An image-only Markdown chapter displays the diagram at full width; the storage section below keeps its text-and-image layout.

## Page icons and use cases

The documentation index and deployment page retain their custom SVG icons in `assets/site/icons/`. The Features page uses 21 distinct icons in `assets/site/icons/features/`. Their provenance is recorded above.

The homepage uses four custom icons for AI agents and memory, analytics, application backends, and an open-ended “Or anything else…” option. Its headings, icon paths, and descriptions stay editable in `content/<language>/home.md`. The 21 feature icons remain on the separate Features page, which uses short descriptions without code examples.

## Storage illustration

The section following Architecture in `features.md` restores the former homepage storage section and its original 660 × 740 SVG. A complete JSON object overlaps a rear plane with hot fields, compact columns, and compressed fields. Persist and Recover arrows connect it to optional S3 journals and snapshots. The shared illustration loader inlines the SVG so every label can come from the Storage diagram table in each language’s `labels.md`. The text, bullet points, durability note, and alternative description are restored from the corresponding homepage Markdown.
