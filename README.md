# OBJY website

A Docsify 5 site with a dark theme, a simple top header, and section navigation fixed to the far left edge. OBJY is the brand; **objy.db and its object-centric database features are the focus**. The homepage has a centered illustrated hero followed directly by three feature columns: Simple API, JSON with extras, and “Runs everywhere, scalable”. Each column has text above its illustration. On wide screens, short curved arrows lead from the API and deployment illustrations toward the central JSON object. A full-width Storage internals section follows, with text beside its larger 3D illustration. The following “Objects that do more” section explains dynamic properties, live references, and user permissions beside a floating-object illustration. The separate Get started now page covers Quick-start (local and cluster deployment), Bring your own cloud, and Browser, with relevant links beneath each explanation. There is no build step.

## Editing

See [the staff editing guide](content/EDITING.md).

All translations are centralized in `content/<language>/`, currently `en` and `de`:

| File in each language folder | Content |
| --- | --- |
| `home.md` | Hero, section explanations, image paths and alternative text, links |
| `sidebar.md` | Homepage menu labels, destinations, and order |
| `labels.md` | Header links, navigation, controls, metadata, diagram labels |
| `get-started.md` | Deployment options: Quick-start, Bring your own cloud, and Browser |
| `documentation.md` | Documentation index and links to individual guides |
| `database.md` | Local deployment reference used by the Get started page |

Use ordinary Markdown. Preserve Docsify's `:id=...` suffixes across translations. The first three `##` headings after the hero create feature columns; later headings create full-width sections. Add a link in `sidebar.md` to include a section in the menu. Routine editorial changes require no HTML, CSS, or JavaScript.

`content/languages.json` registers languages and the default. To add a language, copy an existing folder, translate its Markdown files, and add a registry entry. The switcher is built from the registry. See the editing guide for the complete workflow.

The top-bar Documentation link opens the selected language’s `documentation.md` index. Its entries link to Server documentation at `content/server.md`, JavaScript client documentation at `content/client.md`, and API documentation at `content/api.md`. These shared Markdown includes point to the live objy.db README, client README, and API reference. Add other guides as Markdown headings and links in each index. Both languages use the same English remote sources; the index and website controls remain localized. Remote Markdown links and images resolve against their source, and linked documents keep the site layout and automatic chapter menus.

## Implementation

`index.html` loads the custom theme in `assets/site/site.css`, the module entry point and document/navigation hooks in `assets/site/site.js`. The theme reads the language registry, selects the requested or saved language, and then loads the pinned Docsify distribution in `assets/vendor/docsify.min.js`. Language selection and URL helpers live in `assets/site/languages.mjs`. The source modules have separate responsibilities:

| Module | Responsibility |
| --- | --- |
| `site.js` | Startup, Docsify hooks, chapter menus, navigation, and copy controls |
| `pages.mjs` | Local/remote loading, relative links/images, and translation fallback |
| `languages.mjs` | Language registry, selection, and language URLs |
| `markup.mjs` | Markdown label parsing, translation bindings, and HTML sanitization |
| `homepage.mjs` | Homepage composition, illustration loading, and decorative connections |

Only the homepage module knows about the hero/feature/detail layout. Card sections are detected from subheadings, illustrated detail sections alternate automatically, and decorative connections use the three feature positions rather than particular chapter IDs. The legacy `/DATABASE` spelling remains supported for existing links.

Docsify renders the Markdown and handles routes. The theme uses the curated `sidebar.md` menu on the homepage and automatically builds other pages’ menus from their rendered headings, including indented subchapters. The theme arranges its rendered HTML into the hero, a responsive feature grid, and full-width detail sections, moves its native sidebar into the layout, and binds labels from Markdown tables using Docsify's bundled parser. The mobile menu and active-section indication are supplied by the theme.

The first standalone image in each section's Markdown becomes its illustration. `assets/site/applications-objects.svg` shows apps, AI agents, and APIs sharing floating objects above the centered hero headline. The original logo and icon are restored as `assets/site/logo.png` and `assets/site/favicon.png`. Local SVG illustrations are discovered from the homepage Markdown and loaded only when the homepage is rendered; failed artwork falls back to an ordinary image without disabling navigation. The illustrations are inlined; the application labels, JSON examples, storage labels, and API operation labels are supplied by the selected language’s `labels.md`. The scalability illustration has no editable labels. Image paths and alternative text are editable in the selected language’s `home.md`. Other image files use ordinary image elements. Layout and artwork design remain developer concerns.

Rendered Markdown is sanitized with bundled DOMPurify before it enters the document. Scripts, event handlers, unsafe URLs, styles, forms, and page-supplied translation bindings are removed; headings, code blocks, tables, and details/summary remain available. Local SVG artwork is a trusted repository asset, inlined separately by the homepage module.

Browser metadata updates from the selected language’s `labels.md`; clients that do not execute JavaScript use the fallback tags in `index.html`. Sync those tags when social-preview metadata changes. The neutral loading message, emergency English fallback, no-JavaScript links, and the OBJY wordmark remain in the shell.

## Local preview

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. HTTP is required for Docsify to load Markdown. Fonts, artwork, and the homepage engine are all local, with no package installation required.

## Routes

Sections use standard Docsify hashes with a page-level language parameter: `/?lang=de#/?id=abstract-objects`. Get started opens at `/?lang=de#/get-started`, with deployment chapters generated from its Markdown. The documentation index opens at `/?lang=de#/documentation`; its Server documentation link opens `/?lang=de#/content/server`. The local deployment reference remains at `/?lang=de#/DATABASE`, with the same theme and engine. Existing links without a language parameter use the saved preference or the default language. The explicit URL language wins over the saved preference. Unknown languages use the default. Switching preserves the route and section; preferences remain optional if browser storage is unavailable.

Metadata, the document’s `lang` attribute, controls, alt text, and SVG labels follow the selected language. All document headings keep stable IDs across translations. Code examples and API keys remain unchanged.

Local Markdown links such as `[Database](database.md)` or `[Setup](guides/setup.md)` open in the same layout. Relative links inside nested documents resolve from that document’s folder. No page registration or separate menu file is needed: use `#` for the title, `##` for chapters, and `###` for subchapters. The top-left logo always returns to the homepage while keeping the selected language.

For a route such as `#/guides/setup`, the site looks for `content/<selected-language>/guides/setup.md`, then the default-language version, then `guides/setup.md` at the repository root. Root-level Markdown and shared files such as `content/EDITING.md` are also supported. Missing pages show a localized message and a home link.

## Validation

Run `node --test tests/*.test.mjs` with Node.js. The tests validate language selection, URL preservation, registry entries, translated label parity, section IDs, local links, documentation code examples, arbitrary Markdown routes, remote source loading and relative links, and page-loading fallback. All localized Markdown files are discovered recursively so new documentation pages are included in validation. No package installation or build is needed.

With the preview running, open `http://127.0.0.1:8000/tests/browser.html` for browser regression checks covering safe markup, literal translation values, reusable homepage layouts, missing artwork, and documentation loading without homepage images. Also preview both languages on desktop and mobile when changing layout or translations.

## Content sources

The database descriptions were checked against the sibling `spread-db` repository (`eb221e0`), particularly `README.md`, `API.md`, and the storage implementation. The `objy-db-installer` README and `objydb-terraform` describe deployment and planned resize/restore workflows. These are implementation references, not runtime dependencies of the website.

Compression is in memory; the local write-ahead log and S3 journals/snapshots provide persistence. Replication is asynchronous. Topology changes are planned maintenance. Optional object behavior extensions are distinguished from the database core. Recheck those distinctions when updating product claims.

## Third-party assets

- Docsify 5.0.0, npm package entry `dist/docsify.min.js`, MIT license in `assets/vendor/docsify.LICENSE`.
- DOMPurify 3.4.17, npm package entry `dist/purify.es.mjs`, vendored as `assets/vendor/purify.mjs`; Apache-2.0/MPL-2.0 license in `assets/vendor/purify.LICENSE`.
- Montserrat Regular and SemiBold from Google Fonts, SIL Open Font License in `assets/site/montserrat-LICENSE.txt`.

Artwork details and the original asset sources are recorded in `assets/site/ARTWORK.md`.
