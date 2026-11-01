# OBJY website

A Docsify 5 site with a dark theme, centered top navigation, and a chapter menu fixed to the far left. The homepage introduces OBJY with a headline and one large illustration underneath, followed by four use cases in one row and the complete feature catalog. Learn explains Database and Server through a bike and its owner, and Get Started has its own deployment page. Both are linked in the top bar. The hero connects apps, AI agents, and APIs to hundreds of empty object brackets, suggesting a database that scales. The JSON/API overview and storage internals introduce the complete homepage feature list. All copy, example data, headings, and destinations are managed in Markdown in English and German. There is no build step.

## Editing

See [the staff editing guide](content/EDITING.md).

All translations are centralized in `content/<language>/`, currently `en` and `de`:

| File in each language folder | Content |
| --- | --- |
| `home.md` | Hero, use cases, JSON/API overview, storage internals, full feature catalog, images and links |
| `sidebar.md` | Homepage menu labels, destinations, and order |
| `labels.md` | Header links, navigation, controls, metadata, diagram labels |
| `learn.md` | Five illustrated concepts, short examples, and links to deeper documentation |
| `get-started.md` | Local, cluster, cloud, browser, and embedded setup |
| `documentation.md` | Documentation index and links to individual guides |

Use ordinary Markdown. Preserve Docsify's `:id=...` suffixes across translations. The first standalone hero image appears beneath the headline and introduction. Icon-led bullet lists in the hero become a compact, centered row of highlights, with two columns on smaller screens. Each statement and icon path stays editable in `home.md`. A closing link-only paragraph can become a subtle centered link below that image. Later `##` chapters become full-width detail sections, with illustrated sections alternating text and artwork. Add a link in `sidebar.md` to include a homepage section in the menu. Routine editorial changes require no HTML, CSS, or JavaScript.

`content/languages.json` registers languages and the default. To add a language, copy an existing folder, translate its Markdown files, and add a registry entry. The switcher is built from the registry. See the editing guide for the complete workflow.

The top-bar Documentation link opens the selected language’s `documentation.md` index. It lists Embedded Database, DB Server, REST API, and JavaScript client, in that order. Embedded Database opens `content/database.md`, which loads `DB.md` and covers browsers and Node.js. DB Server opens `content/server.md`, which loads `SERVER.md`; deployment links use this page too. REST API and JavaScript client use `content/api.md` and `content/client.md`. Database, server, and REST API sources come from `objy-org/objy`; the JavaScript client README comes from `objy-org/objy-client`. Add other guides as Markdown headings and links in each index. Those same entries form a persistent documentation tree: selecting a guide loads it and expands its chapters while the other guide roots remain available. Nested chapters can expand independently, and direct links open their ancestors. Both languages use the same English remote sources; the index and website controls remain localized. Remote Markdown links and images resolve against their source, and linked documents keep the site layout and automatic chapter menus.

## Implementation

`index.html` loads the custom theme in `assets/site/site.css`, the module entry point and document/navigation hooks in `assets/site/site.js`. The theme reads the language registry, selects the requested or saved language, and then loads the pinned Docsify distribution in `assets/vendor/docsify.min.js`. Language selection and URL helpers live in `assets/site/languages.mjs`. The source modules have separate responsibilities:

| Module | Responsibility |
| --- | --- |
| `site.js` | Startup, Docsify hooks, navigation integration, and copy controls |
| `navigation.mjs` | Generated chapter menus and persistent Markdown-driven documentation trees |
| `pages.mjs` | Local/remote loading, relative links/images, and translation fallback |
| `languages.mjs` | Language registry, selection, and language URLs |
| `markup.mjs` | Markdown label parsing, translation bindings, and HTML sanitization |
| `homepage.mjs` | Homepage composition, icon columns, shared feature catalogs, overview links, and action links |
| `illustrations.mjs` | Shared local SVG loading, accessible image fallback, and document illustrations |
| `examples.mjs` | Markdown-driven object tabs, one code panel, and keyboard interaction |
| `documents.mjs` | Markdown guide directories, icon-led setup sections, illustrated guides, and feature catalogs |

Only the homepage module knows about the hero/detail layout. Options are detected from subheadings, and illustrated detail sections alternate automatically. Two or more H3 chapters, each containing an optional source-label quote and one code block, create tabs above a single shared code window. Other chapter content keeps its normal layout. Link-only lists become actions in the hero and closing section. The homepage's four use cases are ordinary icon-led H3 chapters in `home.md`: AI agents and memory, analytics, application backends, and an open-ended “Or anything else…” option. The options layout detects the number of chapters, up to four columns on desktop, two on tablets, and one on phones. Icons, headings, descriptions, and order stay editable in Markdown. The complete Features area follows the use cases in `home.md`: the JSON/API overview, storage internals, and all 11 core and 10 server entries. A `##` area containing `###` groups and icon-led `####` entries reuses the document catalog renderer, preserving its heading hierarchy, illustrations, descriptions, and IDs. Content is loaded once from the homepage Markdown; there is no catalog include or separate Features page. Deployment options live only in each language’s `get-started.md`, reached through the top bar.

Learn lives in each language’s `learn.md` at `#/learn`. Its two H2 chapters are Database and Server. Plain H3 topics cover collections, objects, properties, references, queries, vectors and HNSW, storage, the API, users and permissions, clusters, and persistence. The example consistently uses a bike in `bikes` and its owner Alex in `people`. The left menu is generated from the two chapters and their nested topics. Database and Server use the same 20px navigation icons as Documentation and Get Started; nested topics remain text. Illustrated guides can group H3 topics beneath H2 chapters, mixing images, prose, lists, and fenced examples; each main chapter needs at least one standalone image. Single-level illustrated guides remain supported. The shared layout alternates artwork on desktop and stacks it on phones, without route-specific code. Eight SVGs and their labels remain editable through page Markdown and the Learn diagrams table in `labels.md`.

Docsify renders the Markdown and handles routes. The theme uses the curated `sidebar.md` menu on the homepage and automatically builds other pages’ menus from their rendered headings, including indented subchapters. It arranges homepage HTML into the hero and full-width details, moves the native sidebar into the layout, and binds labels from Markdown tables. The theme supplies the mobile menu and active-section indication. A decorative image with empty alternative text in a Markdown heading becomes a menu icon, removed from the content heading. The same rule works for ordinary guides, illustrated guides, and chapters inside the documentation tree.

The main article is centered in the full viewport with matching left and right gutters. The fixed chapter menu sits outside that space. At 1100px and below, the menu becomes a collapsible drawer so the article can use the available width. Homepage sections and Markdown document pages share this layout. Indexes whose chapters each contain an icon heading, one description, and one destination link or a link-only list become a compact directory. A single destination makes the entire row clickable; multiple destinations remain separate text links in the row. Icon chapters containing code or starting with a link-only paragraph/list become open setup sections. Get started uses three such sections: Local, Bring your own cloud, and Embedded. Local installs the CLI once, then has One node and Cluster subsections. Embedded shares one setup example for browsers and Node.js; the cloud-provider buttons stay together. All sections remain visible; the left menu comes directly from the Markdown headings and jumps within the page. Heading icons appear only beside the menu labels, using the same 20px presentation as Documentation. Deep links and language changes preserve the selected section. The documentation index and its guides keep the full root tree in the left menu. Other directories hide the chapter menu; Markdown guides and setup pages generate their own chapters. Guide titles, icons, and destinations come from the localized documentation index. Only selected remote guides are downloaded; tiny local include wrappers identify their sources so direct remote links retain the tree. Both layouts follow Markdown structure without hard-coded route names or entry counts.

The Features link in the left chapter menu jumps to the homepage’s `feature-highlights` section. Its combined diagram shows four API variants, one JSON object, and a physical RAM module. Three simple chips are labeled Hot fields, Columns, and Compressed, followed by one small Markdown caption. Database core and DB server follow as compact icon cards. Consistent headings and generous spacing separate the chapters, without extra divider rules. The homepage chapter menu stays curated in `sidebar.md`; catalog group and feature IDs remain available for direct links. Ordinary document catalogs still use `##` groups with icon-led `###` entries. The shared header moves its four navigation entries onto a second row at 1000px and below.

The first standalone image in each section becomes its illustration. The homepage uses the first symmetric bracket hero, `assets/site/applications-objects-scale.svg`, displayed beneath the headline at up to 1300px. Its orderly field contains 376 empty object brackets on two projected planes, connected to Apps, AI agents, and APIs. The 720 × 480 desktop and 420 × 560 phone layouts share field and endpoint definitions; endpoint labels come from the Application diagram table. The wider asymmetric experiment remains saved unchanged at `assets/site/applications-objects-chaos.svg` (commit `3077520`), and the original layered-object hero remains at `assets/site/applications-objects.svg`. Change the image path and description in both localized `home.md` files to restore either variant. Connection pulses respect reduced-motion preferences. The homepage Features area starts with `architecture.svg`: CRUD, queries, aggregation, and vector search above one compact bike JSON example. A physical RAM module underneath has gold contacts and three chips with short labels. The wide 1000 × 570 and phone 360 × 600 layouts share the same JSON definition and translations. The diagram is capped at 900px. API and object text come from the Architecture diagram table; short memory labels come from the Storage diagram table, shared with Learn. There are no explanation paragraphs inside the image. There is no second illustration or separate storage explanation below the picture. Only pages that reference large illustrations fetch their SVGs. Failed artwork falls back to an ordinary image. Image paths and alternative text live in each page’s Markdown.

Rendered Markdown is sanitized with bundled DOMPurify before it enters the document. Scripts, event handlers, unsafe URLs, styles, forms, and page-supplied translation bindings are removed; headings, code blocks, tables, and details/summary remain available. Local SVG artwork is a trusted repository asset, inlined separately by the shared illustration module.

Fenced code blocks use Docsify's built-in Prism highlighter with a palette matched to the dark theme. Local grammar modules add JSON, Bash/shell, TypeScript, HTTP, YAML, and Markdown to the bundled JavaScript, HTML/XML, CSS, and C-like support. They load before the first page renders, with no runtime CDN dependency. Local and remote documents share the same highlighting; homepage example tabs retain their highlighted code when switched. Specify the language after the opening fence, such as `json`, `js`, `ts`, `sh`, or `http`.

Browser metadata updates from the selected language’s `labels.md`; clients that do not execute JavaScript use the fallback tags in `index.html`. Sync those tags when social-preview metadata changes. The neutral loading message, emergency English fallback, no-JavaScript links, and the home logo remain in the shell. Top-menu links highlight the matching page or descendant route with `aria-current="page"`. The Documentation entry is the fallback for guides without their own top-menu link, including live remote documents.

## Local preview

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. HTTP is required for Docsify to load Markdown. Fonts, artwork, and the homepage engine are all local, with no package installation required.

## Routes

Old `#/features` bookmarks redirect to the homepage Features area, preserving chapter IDs. Sections use standard Docsify hashes with a page-level language parameter: `/?lang=de#/?id=object-capabilities`. The top-bar Get Started link opens `/?lang=de#/get-started`, with deployment chapters generated from its Markdown. The documentation index opens at `/?lang=de#/documentation`; its Database link opens `/?lang=de#/content/database`. Local and cloud setup links open `/content/server?id=start-one-node`; cluster setup opens `/content/server?id=form-a-cluster`. Browser setup opens `/content/database?id=install-in-a-browser`; embedding in Node.js opens `/content/database?id=install-in-nodejs`. Existing links without a language parameter use the saved preference or the default language. The explicit URL language wins over the saved preference. Unknown languages use the default. Switching preserves the route and section; preferences remain optional if browser storage is unavailable.

Metadata, the document’s `lang` attribute, controls, alt text, and SVG labels follow the selected language. All document headings keep stable IDs across translations. Code examples and API keys remain unchanged.

Local Markdown links such as `[Documentation](documentation.md)` or `[Setup](guides/setup.md)` open in the same layout. Relative links inside nested documents resolve from that document’s folder. No page registration or separate menu file is needed: use `#` for the title, `##` for chapters, and `###` for subchapters. The top-left logo always returns to the homepage while keeping the selected language.

For a route such as `#/guides/setup`, the site looks for `content/<selected-language>/guides/setup.md`, then the default-language version, then `guides/setup.md` at the repository root. Root-level Markdown and shared files such as `content/EDITING.md` are also supported. Missing pages show a localized message and a home link.

## Validation

Run `node --test tests/*.test.mjs` with Node.js. The tests validate language selection, URL preservation, registry entries, translated label parity, section IDs, local links, documentation code examples, arbitrary Markdown routes, remote source loading and relative links, and page-loading fallback. All localized Markdown files are discovered recursively so new documentation pages are included in validation. No package installation or build is needed.

With the preview running, open `http://127.0.0.1:8000/tests/browser.html` for browser regression checks covering safe markup, syntax highlighting with unchanged source and copied text, literal translation values, reusable homepage layouts, missing artwork, documentation loading without homepage images, persistent documentation roots with live chapters and nested deep links, homepage use-case columns, reusable object tabs, deep links, keyboard navigation, listener cleanup, Markdown action links, viewport centering, the responsive chapter menu, Markdown deployment sections and chapter jumps, simplified feature-catalog navigation, and header navigation in both languages from 320px to desktop. Also preview both languages on desktop and mobile when changing layout or translations.

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
