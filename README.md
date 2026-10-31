# OBJY website

A Docsify 5 site with a dark theme, centered top navigation, and a chapter menu fixed to the far left. The homepage introduces OBJY with a headline and one large architecture illustration underneath, followed by an interactive object example and a closing Quick Start section. The diagram shows APIs, one JSON object, three simple in-memory storage tiers, and optional S3 durability. All copy, example data, headings, and destinations are managed in Markdown in English and German. There is no build step.

## Editing

See [the staff editing guide](content/EDITING.md).

All translations are centralized in `content/<language>/`, currently `en` and `de`:

| File in each language folder | Content |
| --- | --- |
| `home.md` | Hero, section explanations, image paths and alternative text, links |
| `sidebar.md` | Homepage menu labels, destinations, and order |
| `labels.md` | Header links, navigation, controls, metadata, diagram labels |
| `get-started.md` | Local, cluster, cloud, browser, and embedded setup |
| `documentation.md` | Documentation index and links to individual guides |
| `features.md` | Icon-led catalog of database core and DB server features |

Use ordinary Markdown. Preserve Docsify's `:id=...` suffixes across translations. The first standalone hero image appears beneath the headline and introduction. A closing link-only paragraph becomes a subtle centered link below that image. Later `##` chapters become full-width detail sections, with illustrated sections alternating text and artwork. Add a link in `sidebar.md` to include a homepage section in the menu. Routine editorial changes require no HTML, CSS, or JavaScript.

`content/languages.json` registers languages and the default. To add a language, copy an existing folder, translate its Markdown files, and add a registry entry. The switcher is built from the registry. See the editing guide for the complete workflow.

The top-bar Documentation link opens the selected language’s `documentation.md` index. It lists Embedded Database, DB Server, REST API, and JavaScript client, in that order. Embedded Database opens `content/database.md`, which loads `DB.md` and covers browsers and Node.js. DB Server opens `content/server.md`, which loads `SERVER.md`; deployment links use this page too. REST API and JavaScript client use `content/api.md` and `content/client.md`. Database, server, and REST API sources come from `objy-org/objy`; the JavaScript client README comes from `objy-org/objy-client`. Add other guides as Markdown headings and links in each index. Both languages use the same English remote sources; the index and website controls remain localized. Remote Markdown links and images resolve against their source, and linked documents keep the site layout and automatic chapter menus.

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
| `documents.mjs` | Markdown guide directories, deployment accordions, feature catalogs, and chapter deep links |

Only the homepage module knows about the hero/detail layout. Options are detected from subheadings, and illustrated detail sections alternate automatically. Two or more H3 chapters, each containing an optional source-label quote and one code block, create tabs above a single shared code window. Other chapter content keeps its normal layout. Link-only lists become actions in the hero and closing section. The example tabs show a connected device, AI memory, a file object, a query, and aggregation through the JavaScript client. They display sample content without contacting a database.

Docsify renders the Markdown and handles routes. The theme uses the curated `sidebar.md` menu on the homepage and automatically builds other pages’ menus from their rendered headings, including indented subchapters. It arranges homepage HTML into the hero and full-width details, moves the native sidebar into the layout, and binds labels from Markdown tables. The theme supplies the mobile menu and active-section indication.

The main article is centered in the full viewport with matching left and right gutters. The fixed chapter menu sits outside that space. At 1100px and below, the menu becomes a collapsible drawer so the article can use the available width. Homepage sections and Markdown document pages share this layout. Indexes whose chapters each contain an icon heading, one description, and one destination link or a link-only list become a compact directory. A single destination makes the entire row clickable; multiple destinations remain separate text links in the row. Icon chapters starting with a code block or a link-only paragraph/list become native accordion rows instead. Get started uses five such rows, with 64px colored icons, commands, cloud-provider buttons, and one guide link per option. One row opens at a time, and chapter links open the matching row. The chapter menu is hidden on directories and accordions and returns on ordinary documents. Both layouts follow Markdown structure without hard-coded route names or entry counts.

The Features page at `#/features` uses a third reusable document pattern: `##` groups containing icon-led `###` entries become compact individual sections. Group introductions and all entry content are preserved, and every feature appears in the chapter menu. A single closing code block sits beside its explanation when the article has enough room, then stacks underneath on smaller screens. The page presents 11 core capabilities and 10 server capabilities with distinct custom SVG icons and 15 examples of at most seven lines. The shared header moves its four navigation entries onto a second row at 1000px and below.

The first standalone image in each section becomes its illustration. The hero artwork is capped at 1000px, shrinking to the available content width. `assets/site/architecture.svg` shows CRUD, queries, aggregation, and vector search feeding one JSON object. A shifted rear plane exposes three simple storage tiers: hot fields, columns, and compressed bodies. Optional S3 journals and snapshots sit underneath. Below 641px it uses a compact composition capped at 400px. Shared SVG definitions keep the single object, storage plane, and S3 artwork consistent between layouts. All labels and JSON lines come from the Architecture diagram table in `content/<language>/labels.md`. The top-left logo and favicon remain unchanged. Local SVGs load only on the homepage; failed artwork falls back to an ordinary image. Image paths and alternative text live in `home.md`.

Rendered Markdown is sanitized with bundled DOMPurify before it enters the document. Scripts, event handlers, unsafe URLs, styles, forms, and page-supplied translation bindings are removed; headings, code blocks, tables, and details/summary remain available. Local SVG artwork is a trusted repository asset, inlined separately by the homepage module.

Fenced code blocks use Docsify's built-in Prism highlighter with a palette matched to the dark theme. Local grammar modules add JSON, Bash/shell, TypeScript, HTTP, YAML, and Markdown to the bundled JavaScript, HTML/XML, CSS, and C-like support. They load before the first page renders, with no runtime CDN dependency. Local and remote documents share the same highlighting; homepage example tabs retain their highlighted code when switched. Specify the language after the opening fence, such as `json`, `js`, `ts`, `sh`, or `http`.

Browser metadata updates from the selected language’s `labels.md`; clients that do not execute JavaScript use the fallback tags in `index.html`. Sync those tags when social-preview metadata changes. The neutral loading message, emergency English fallback, no-JavaScript links, and the home logo remain in the shell. Top-menu links highlight the matching page or descendant route with `aria-current="page"`. The Documentation entry is the fallback for guides without their own top-menu link, including live remote documents.

## Local preview

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. HTTP is required for Docsify to load Markdown. Fonts, artwork, and the homepage engine are all local, with no package installation required.

## Routes

Sections use standard Docsify hashes with a page-level language parameter: `/?lang=de#/?id=object-capabilities`. Get started opens at `/?lang=de#/get-started`, with deployment chapters generated from its Markdown. The documentation index opens at `/?lang=de#/documentation`; its Database link opens `/?lang=de#/content/database`. Local and cloud setup links open `/content/server?id=start-one-node`; cluster setup opens `/content/server?id=form-a-cluster`. Browser setup opens `/content/database?id=install-in-a-browser`; embedding in Node.js opens `/content/database?id=install-in-nodejs`. Existing links without a language parameter use the saved preference or the default language. The explicit URL language wins over the saved preference. Unknown languages use the default. Switching preserves the route and section; preferences remain optional if browser storage is unavailable.

Metadata, the document’s `lang` attribute, controls, alt text, and SVG labels follow the selected language. All document headings keep stable IDs across translations. Code examples and API keys remain unchanged.

Local Markdown links such as `[Documentation](documentation.md)` or `[Setup](guides/setup.md)` open in the same layout. Relative links inside nested documents resolve from that document’s folder. No page registration or separate menu file is needed: use `#` for the title, `##` for chapters, and `###` for subchapters. The top-left logo always returns to the homepage while keeping the selected language.

For a route such as `#/guides/setup`, the site looks for `content/<selected-language>/guides/setup.md`, then the default-language version, then `guides/setup.md` at the repository root. Root-level Markdown and shared files such as `content/EDITING.md` are also supported. Missing pages show a localized message and a home link.

## Validation

Run `node --test tests/*.test.mjs` with Node.js. The tests validate language selection, URL preservation, registry entries, translated label parity, section IDs, local links, documentation code examples, arbitrary Markdown routes, remote source loading and relative links, and page-loading fallback. All localized Markdown files are discovered recursively so new documentation pages are included in validation. No package installation or build is needed.

With the preview running, open `http://127.0.0.1:8000/tests/browser.html` for browser regression checks covering safe markup, syntax highlighting with unchanged source and copied text, literal translation values, reusable homepage layouts, missing artwork, documentation loading without homepage images, object tabs, deep links, keyboard navigation, listener cleanup, Markdown action links, viewport centering, the responsive chapter menu, deployment accordions, feature catalogs, and header navigation in both languages from 320px to desktop. Also preview both languages on desktop and mobile when changing layout or translations.

## Content sources

Documentation links were checked against `objy-org/objy` at `8efa9fe08eaff677055b6ab2bfe289e26cb44167`. The shared pages load its live `DB.md`, `SERVER.md`, and `API.md`; JavaScript client documentation loads `README.md` from `objy-org/objy-client`. Browser examples use the universal `@objy/db` package.

The database descriptions were checked against the sibling `spread-db` repository (`eb221e0`), particularly `README.md`, `API.md`, and the storage implementation. The `objy-db-installer` README and `objydb-terraform` describe deployment and planned resize/restore workflows. These are implementation references, not runtime dependencies of the website.

Compression is in memory; the local write-ahead log and S3 journals/snapshots provide persistence. Replication is asynchronous. Topology changes are planned maintenance. Optional object behavior extensions are distinguished from the database core. Recheck those distinctions when updating product claims.

## Third-party assets

- Docsify 5.0.0, npm package entry `dist/docsify.min.js`, MIT license in `assets/vendor/docsify.LICENSE`.
- Prism 1.30.0 language components from the official `PrismJS/prism` release tag: JSON, Bash, TypeScript, HTTP, YAML, and Markdown. Vendored unchanged in `assets/vendor/prism-*.min.js`, with MIT license in `assets/vendor/prism.LICENSE`; the core is already bundled with Docsify.
- DOMPurify 3.4.17, npm package entry `dist/purify.es.mjs`, vendored as `assets/vendor/purify.mjs`; Apache-2.0/MPL-2.0 license in `assets/vendor/purify.LICENSE`.
- Montserrat Regular and SemiBold from Google Fonts, SIL Open Font License in `assets/site/montserrat-LICENSE.txt`.
- Original OBJY and live OBJY DB documentation source notices are retained in `assets/vendor/objy.LICENSE` and `assets/vendor/objy-db.LICENSE`. Brand usage rights were confirmed by the user; see the icon provenance review in `assets/site/ARTWORK.md`.

Artwork details and the original asset sources are recorded in `assets/site/ARTWORK.md`.
