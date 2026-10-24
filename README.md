# OBJY website

A Docsify 5 site with a dark theme, a simple top header, and section navigation fixed to the far left edge. OBJY is the brand; **objy.db and its object-centric database features are the focus**. The homepage has a centered illustrated hero followed directly by three feature columns: Simple API, JSON with extras, and “Runs everywhere, scalable”. Each column has text above its illustration. On wide screens, short curved arrows lead from the API and deployment illustrations toward the central JSON object. A full-width Storage internals section follows, with text beside its larger 3D illustration. The following “Objects that do more” section explains dynamic properties, live references, and user permissions beside a floating-object illustration. A final Deployment section covers Quick-start (local and cluster deployment), Bring your own cloud, and Browser, with relevant links beneath each explanation. There is no build step.

## Editing

See [the staff editing guide](content/EDITING.md).

All translations are centralized in `content/<language>/`, currently `en` and `de`:

| File in each language folder | Content |
| --- | --- |
| `home.md` | Hero, section explanations, image paths and alternative text, links |
| `sidebar.md` | Section menu labels, destinations, and order |
| `labels.md` | Header links, navigation, controls, metadata, diagram labels |
| `database.md` | Database documentation |

Use ordinary Markdown. Preserve Docsify's `:id=...` suffixes across translations. The first three `##` headings after the hero create feature columns; later headings create full-width sections. Add a link in `sidebar.md` to include a section in the menu. Routine editorial changes require no HTML, CSS, or JavaScript.

`content/languages.json` registers languages and the default. To add a language, copy an existing folder, translate its four Markdown files, and add a registry entry. The switcher is built from the registry. See the editing guide for the complete workflow.

## Implementation

`index.html` loads the custom theme in `assets/site/site.css`, configuration and layout hooks in `assets/site/site.js`. The theme reads the language registry, selects the requested or saved language, and then loads the pinned Docsify distribution in `assets/vendor/docsify.min.js`. Language selection and URL helpers live in `assets/site/languages.mjs`.

Docsify renders the Markdown, manages the sidebar, and handles routes. The theme arranges its rendered HTML into the hero, a responsive feature grid, and full-width detail sections, moves its native sidebar into the layout, and binds labels from Markdown tables using Docsify's bundled parser. The mobile menu and active-section indication are supplied by the theme.

The first standalone image in each section's Markdown becomes its illustration. `assets/site/applications-objects.svg` shows apps, AI agents, and APIs sharing floating objects above the centered hero headline. The original logo and icon are restored as `assets/site/logo.png` and `assets/site/favicon.png`. The hero and five section SVGs are loaded and inlined; the application labels, JSON examples, storage labels, and API operation labels are supplied by the selected language’s `labels.md`. The scalability illustration has no editable labels. Image paths and alternative text are editable in the selected language’s `home.md`. Other image files use ordinary image elements. Layout and artwork design remain developer concerns.

Only trusted repository Markdown is rendered. Add sanitization before accepting untrusted page submissions.

Browser metadata updates from the selected language’s `labels.md`; clients that do not execute JavaScript use the fallback tags in `index.html`. Sync those tags when social-preview metadata changes. The neutral loading message, emergency English fallback, no-JavaScript links, and the OBJY wordmark remain in the shell.

## Local preview

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. HTTP is required for Docsify to load Markdown. Fonts, artwork, and the homepage engine are all local, with no package installation required.

## Routes

Sections use standard Docsify hashes with a page-level language parameter: `/?lang=de#/?id=abstract-objects`. Documentation opens at `/?lang=de#/DATABASE` with the same theme and engine. Existing links without a language parameter use the saved preference or the default language. The explicit URL language wins over the saved preference. Unknown languages use the default. Switching preserves the route and section; preferences remain optional if browser storage is unavailable.

Metadata, the document’s `lang` attribute, controls, alt text, and SVG labels follow the selected language. All document headings keep stable IDs across translations. Code examples and API keys remain unchanged.

## Validation

Run `node --test tests/languages.test.mjs` with Node.js. The tests validate language selection, URL preservation, registry entries, translated label parity, section IDs, local links, and documentation code examples. No package installation or build is needed. Also preview both languages on desktop and mobile when changing layout or translations.

## Content sources

The database descriptions were checked against the sibling `spread-db` repository (`eb221e0`), particularly `README.md`, `API.md`, and the storage implementation. The `objy-db-installer` README and `objydb-terraform` describe deployment and planned resize/restore workflows. These are implementation references, not runtime dependencies of the website.

Compression is in memory; the local write-ahead log and S3 journals/snapshots provide persistence. Replication is asynchronous. Topology changes are planned maintenance. Optional object behavior extensions are distinguished from the database core. Recheck those distinctions when updating product claims.

## Third-party assets

- Docsify 5.0.0, npm package entry `dist/docsify.min.js`, MIT license in `assets/vendor/docsify.LICENSE`.
- Montserrat Regular and SemiBold from Google Fonts, SIL Open Font License in `assets/site/montserrat-LICENSE.txt`.

Artwork details and the original asset sources are recorded in `assets/site/ARTWORK.md`.
