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
| `assets/site/architecture.svg` | Custom SVG geometry created for the architecture overview on 2026-10-31. No downloaded icons, external artwork, or third-party icon library is used. |
| `assets/site/branding/objy-db-mark-white.svg` and `.png` | Custom white-on-transparent OBJY DB mark created for this project. The PNG is a raster export of the matching SVG; neither includes third-party artwork. |
| `logo.png` and `favicon.png` | Existing OBJY brand assets restored byte-for-byte from `e62ff79`. The user confirmed in this project on 2026-10-27 that OBJY owns or has permission to use the existing logo and favicon. The original README references [OBJY's MIT license](https://github.com/objy-org/objy/blob/master/LICENSE.md); a copy of that notice is retained in `assets/vendor/objy.LICENSE`. |
| Artwork displayed by live documentation | The main README currently references `https://raw.githubusercontent.com/objy-org/objy/main/public/branding/objy-db-header-deep-field.png`. The user confirmed rights to the existing OBJY branding on 2026-10-27. The source repository publishes an [MIT license](https://github.com/objy-org/objy/blob/main/LICENSE) and a [brand notice](https://github.com/objy-org/objy/blob/main/NOTICE.md). The earlier source license notice remains in `assets/vendor/objy-db.LICENSE`. |

The old third-party-looking raster illustrations under the historical `icons/` folder are absent from this branch and are not used by the current site. Cloud providers and GitHub are linked by text, without their logos. Menu indicators and arrows use text/CSS shapes rather than an icon font. Montserrat's SIL Open Font License remains in `assets/site/montserrat-LICENSE.txt`.

No missing third-party icon attribution was found in this review. The brand-rights confirmation above comes from the user; repository history alone is not proof of ownership. Live documentation can change independently, so newly introduced remote images need their own provenance check.

## Architecture illustration

`assets/site/architecture.svg` is the single homepage illustration, displayed beneath the headline and description. CRUD, Query, Aggregate, and Vector feed into one JSON object. A shifted storage plane sits behind and below it, with three broad tiers for hot fields, compact columns, and compressed bodies. The layered geometry adapts the earlier storage sketch from `3f1a306`. Two-way arrows connect that layer to a separate dashed optional S3 panel for journals and snapshots.

The SVG uses a wide 1000 × 760 composition and a shorter phone composition of 360 × 670 below 641px. Both share one JSON face, a three-tier rear plane, and the S3 artwork. Tier labels stay visible beside or below the foreground object; the individual storage icons and explanatory captions have been removed. All labels and JSON lines are supplied by the Architecture diagram table in each language’s `labels.md`. The image path and screen-reader description live in `home.md`.

The former apps/agents hero, individual feature illustrations, and separate storage illustration have been removed from the current branch. Their earlier versions remain recoverable in Git history.

## Page icons and object example

The documentation index and deployment page retain their custom SVG icons in `assets/site/icons/`. The Features page uses 21 distinct icons in `assets/site/icons/features/`. Their provenance is recorded above.

The object example uses selectable Markdown chapters and code blocks. Its labels, source labels, and sample data remain editable in `content/<language>/home.md`.
