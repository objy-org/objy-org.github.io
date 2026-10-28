# OBJY website

A Docsify 5 site with a dark theme, centered top navigation, and a chapter menu fixed to the far left. The homepage has a large illustrated hero, one wide object diagram with four surrounding callouts, an interactive object example, storage internals, and a closing Quick Start section. All copy, example data, headings, and destinations are managed in Markdown in English and German. The separate Get started page covers local and cluster setup, bring your own cloud, and browser deployment. There is no build step.

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

Use ordinary Markdown. Preserve Docsify's `:id=...` suffixes across translations. An illustrated `##` section with `###` subheadings becomes one overview: the image sits between its Markdown callouts on desktop, then above them on narrow screens. Keep the overview immediately after the hero; the interactive code example and other detail sections follow it. Add a link in `sidebar.md` to include a section in the menu. Routine editorial changes require no HTML, CSS, or JavaScript.

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
| `homepage.mjs` | Homepage composition, illustration loading, and action-link layouts |
| `examples.mjs` | Markdown-driven object tabs, one code panel, and keyboard interaction |

Only the homepage module knows about the hero, illustrated overview, and detail layouts. Illustrated chapters with subheadings become one diagram with callouts; no section names or callout count are hard-coded. Simple illustrated chapters without subheadings can still form an optional feature grid. Card sections are detected from subheadings, and illustrated detail sections alternate automatically. Two or more H3 chapters, each containing an optional source-label quote and one code block, create tabs above a single shared code window. Other chapter content keeps its normal layout. The renderer uses this structure rather than fixed section names or object fields. Link-only lists become actions in the hero and closing section. The example tabs show a connected device, AI memory with an embedding, a file object after upload, a filtered and sorted query, and collection aggregation through the JavaScript client. They display local sample content and do not contact a database.

Docsify renders the Markdown and handles routes. The theme uses the curated `sidebar.md` menu on the homepage and automatically builds other pages’ menus from their rendered headings, including indented subchapters. The theme arranges its rendered HTML into the hero, a responsive illustrated overview, and full-width detail sections, moves its native sidebar into the layout, and binds labels from Markdown tables using Docsify's bundled parser. The mobile menu and active-section indication are supplied by the theme.

The main article is centered in the full viewport with matching left and right gutters. The fixed chapter menu sits outside that space. At 1100px and below, the menu becomes a collapsible drawer so the article can use the available width. Homepage sections and Markdown document pages share this layout.

The first standalone image in each section's Markdown becomes its illustration. The hero artwork is capped at 600px on desktop and 420px on mobile, shrinking to the available content width on smaller screens. `assets/site/applications-objects.svg` shows apps, AI agents, and APIs sharing floating objects above the centered hero headline. The top-left header logo uses `assets/site/branding/objy-db-mark-white.png`. The original icon is retained as `assets/site/favicon.png`. Local SVG illustrations are discovered from the homepage Markdown and loaded only when the homepage is rendered; failed artwork falls back to an ordinary image without disabling navigation. The illustrations are inlined; the application labels, JSON examples, and storage labels are supplied by the selected language’s `labels.md`. Overview callout headings and descriptions come directly from `home.md`. Image paths and alternative text are editable in the selected language’s `home.md`. Other image files use ordinary image elements. Layout and artwork design remain developer concerns.

Rendered Markdown is sanitized with bundled DOMPurify before it enters the document. Scripts, event handlers, unsafe URLs, styles, forms, and page-supplied translation bindings are removed; headings, code blocks, tables, and details/summary remain available. Local SVG artwork is a trusted repository asset, inlined separately by the homepage module.

Browser metadata updates from the selected language’s `labels.md`; clients that do not execute JavaScript use the fallback tags in `index.html`. Sync those tags when social-preview metadata changes. The neutral loading message, emergency English fallback, no-JavaScript links, and the home logo remain in the shell. Top-menu links highlight the matching page or descendant route with `aria-current="page"`. The Documentation entry is the fallback for guides without their own top-menu link, including live remote documents.

## Local preview

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. HTTP is required for Docsify to load Markdown. Fonts, artwork, and the homepage engine are all local, with no package installation required.

## Routes

Sections use standard Docsify hashes with a page-level language parameter: `/?lang=de#/?id=abstract-objects`. Get started opens at `/?lang=de#/get-started`, with deployment chapters generated from its Markdown. The documentation index opens at `/?lang=de#/documentation`; its Server documentation link opens `/?lang=de#/content/server`. The Run locally and Cluster setup links open the live server documentation at its Quick Start and Run a Cluster chapters. Existing links without a language parameter use the saved preference or the default language. The explicit URL language wins over the saved preference. Unknown languages use the default. Switching preserves the route and section; preferences remain optional if browser storage is unavailable.

Metadata, the document’s `lang` attribute, controls, alt text, and SVG labels follow the selected language. All document headings keep stable IDs across translations. Code examples and API keys remain unchanged.

Local Markdown links such as `[Documentation](documentation.md)` or `[Setup](guides/setup.md)` open in the same layout. Relative links inside nested documents resolve from that document’s folder. No page registration or separate menu file is needed: use `#` for the title, `##` for chapters, and `###` for subchapters. The top-left logo always returns to the homepage while keeping the selected language.

For a route such as `#/guides/setup`, the site looks for `content/<selected-language>/guides/setup.md`, then the default-language version, then `guides/setup.md` at the repository root. Root-level Markdown and shared files such as `content/EDITING.md` are also supported. Missing pages show a localized message and a home link.

## Validation

Run `node --test tests/*.test.mjs` with Node.js. The tests validate language selection, URL preservation, registry entries, translated label parity, section IDs, local links, documentation code examples, arbitrary Markdown routes, remote source loading and relative links, and page-loading fallback. All localized Markdown files are discovered recursively so new documentation pages are included in validation. No package installation or build is needed.

With the preview running, open `http://127.0.0.1:8000/tests/browser.html` for browser regression checks covering safe markup, literal translation values, reusable homepage layouts, missing artwork, documentation loading without homepage images, object tabs, deep links, keyboard navigation, listener cleanup, Markdown action links, viewport centering, and the responsive chapter menu. Also preview both languages on desktop and mobile when changing layout or translations.

## Content sources

The database descriptions were checked against the sibling `spread-db` repository (`eb221e0`), particularly `README.md`, `API.md`, and the storage implementation. The `objy-db-installer` README and `objydb-terraform` describe deployment and planned resize/restore workflows. These are implementation references, not runtime dependencies of the website.

Compression is in memory; the local write-ahead log and S3 journals/snapshots provide persistence. Replication is asynchronous. Topology changes are planned maintenance. Optional object behavior extensions are distinguished from the database core. Recheck those distinctions when updating product claims.

## Third-party assets

- Docsify 5.0.0, npm package entry `dist/docsify.min.js`, MIT license in `assets/vendor/docsify.LICENSE`.
- DOMPurify 3.4.17, npm package entry `dist/purify.es.mjs`, vendored as `assets/vendor/purify.mjs`; Apache-2.0/MPL-2.0 license in `assets/vendor/purify.LICENSE`.
- Montserrat Regular and SemiBold from Google Fonts, SIL Open Font License in `assets/site/montserrat-LICENSE.txt`.
- Original OBJY and live OBJY DB documentation source notices are retained in `assets/vendor/objy.LICENSE` and `assets/vendor/objy-db.LICENSE`. Brand usage rights were confirmed by the user; see the icon provenance review in `assets/site/ARTWORK.md`.

Artwork details and the original asset sources are recorded in `assets/site/ARTWORK.md`.
