# OBJY website

A Docsify 5 site with a dark theme, a simple top header, and section navigation fixed to the far left edge. OBJY is the brand; **objy.db and its object-centric database features are the focus**. The homepage has a centered hero followed by three feature columns: JSON objects, scalability, and fast, efficient storage. Each column has text above its illustration. There is no build step.

## Editing

See [the staff editing guide](content/EDITING.md).

| File | Content |
| --- | --- |
| `content/home.md` | Hero, section explanations, image paths and alternative text, links |
| `_sidebar.md` | Section menu labels, destinations, and ordering |
| `content/labels.md` | Header links, navigation labels, browser metadata, diagram labels |
| `DATABASE.md` | Database documentation |

Use ordinary Markdown. Preserve Docsify's `:id=...` suffixes when renaming headings. A new `##` heading creates a feature column; add a link in `_sidebar.md` to include it in the menu. Routine editorial changes require no HTML, CSS, or JavaScript.

## Implementation

`index.html` loads the custom theme in `assets/site/site.css`, configuration and layout hooks in `assets/site/site.js`, and the pinned Docsify distribution in `assets/vendor/docsify.min.js`.

Docsify renders the Markdown, manages the sidebar, and handles routes. The theme arranges its rendered HTML into the hero and a responsive feature grid, moves its native sidebar into the layout, and binds labels from Markdown tables using Docsify's bundled parser. The mobile menu and active-section indication are supplied by the theme.

The first standalone image in each section's Markdown becomes its illustration. `assets/site/header-objects.svg` shows JSON objects flowing around RAM modules above the centered hero text. The original logo and icon are restored as `assets/site/logo.png` and `assets/site/favicon.png`. The hero and three section SVGs are loaded and inlined; the JSON example and short storage labels are supplied by `content/labels.md`, while the scalability illustration is text-free. Image paths and alternative text are editable in `content/home.md`. Other image files use ordinary image elements. Layout and artwork design remain developer concerns.

Only trusted repository Markdown is rendered. Add sanitization before accepting untrusted page submissions.

Browser metadata updates from `content/labels.md`; clients that do not execute JavaScript use the fallback tags in `index.html`. Sync those tags when social-preview metadata changes. Loading/no-JavaScript messages and the OBJY wordmark also remain in the shell.

## Local preview

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. HTTP is required for Docsify to load Markdown. Fonts, artwork, and the homepage engine are all local, with no package installation required.

## Routes

Sections use standard Docsify URLs such as `/#/?id=abstract-objects`. Database documentation opens at `/#/DATABASE` and uses the same layout, fonts, and locally bundled Docsify engine as the homepage.

## Content sources

The database descriptions were checked against the sibling `spread-db` repository (`eb221e0`), particularly `README.md`, `API.md`, and the storage implementation. The `objy-db-installer` README and `objydb-terraform` describe deployment and planned resize/restore workflows. These are implementation references, not runtime dependencies of the website.

Compression is in memory; the local write-ahead log and S3 journals/snapshots provide persistence. Replication is asynchronous. Topology changes are planned maintenance. Optional object behavior extensions are distinguished from the database core. Recheck those distinctions when updating product claims.

## Third-party assets

- Docsify 5.0.0, npm package entry `dist/docsify.min.js`, MIT license in `assets/vendor/docsify.LICENSE`.
- Montserrat Regular and SemiBold from Google Fonts, SIL Open Font License in `assets/site/montserrat-LICENSE.txt`.

Artwork details and the original asset sources are recorded in `assets/site/ARTWORK.md`.
