# OBJY website

This is a **Docsify 5 website with a custom OBJY theme**. Docsify loads the Markdown, renders the page, loads the sidebar, and handles links and routes. There is no build step or separate Markdown renderer to maintain. The repository remains suitable for GitHub Pages.

## Content editing

Start with [the editing guide](content/EDITING.md). Staff can update the content using Markdown:

| File | Content |
| --- | --- |
| `content/home.md` | Hero, product introduction, feature headings and text, bullet points, calls to action |
| `_sidebar.md` | Left menu labels, destinations, and ordering |
| `content/labels.md` | Header/footer links, diagram captions and labels, accessible descriptions, browser page title and description |
| `content/examples.md` | Interactive example buttons, object names, and property tables |
| `DOCUMENTATION.md` and the existing documentation files | Technical documentation |

The homepage uses ordinary Markdown headings and Docsify's `:id=...` heading anchors. An introductory blockquote immediately after a heading is styled as a small section label. No custom section-marker format is required. A new second-level heading creates a new section; add its link to `_sidebar.md` to include it in the menu. Preserve existing IDs when editing headings.

## Theme implementation

`index.html` loads `assets/site/site.css`, the Docsify configuration/theme plugin in `assets/site/site.js`, and the pinned Docsify distribution in `assets/vendor/docsify.min.js`.

The theme uses Docsify's `beforeEach`, `afterEach`, and `doneEach` hooks. It arranges **already-rendered Docsify HTML** into the hero and feature layout and places Docsify's own sidebar next to the content. The known section IDs select the existing illustrations; other sections use a text layout. The plugin binds labels from Markdown tables and reads illustrative object examples using the parser bundled with Docsify.

The geometry of the hero lives in `assets/site/object-universe.svg`; its text comes from Markdown. The logo, layout, colors, and custom illustration designs remain theme concerns. The label tables' second-level headings and first columns are stable identifiers; editors change the right-hand values. The examples illustrate concepts and do not execute database operations.

Only trusted repository Markdown is rendered. Do not accept untrusted submissions as page content without adding sanitization.

Browser page metadata updates from `content/labels.md`. Clients that do not execute JavaScript use the fallback tags in `index.html`; a developer should sync those tags when static social-preview metadata changes. Loading/error messages and no-JavaScript fallback text also remain in the HTML/theme.

## Local preview

From this repository:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. Serve over HTTP so Docsify can load the Markdown. The landing page's engine, font, artwork, and styles are local files; no package installation is needed.

## Routes and documentation

A homepage section uses a standard Docsify URL such as `/#/?id=objects`. The theme also translates earlier plain anchors such as `/#objects` to that format. Links to other Markdown files, including existing routes such as `/#/PLATFORM`, are rendered by Docsify in the same shell. Links starting with `docs/` open the existing documentation site directly.

The existing `docs/` reader remains available and loads this repository's `DOCUMENTATION.md`. The product is called `objy.db`; the documented npm package remains `objy`.

## Third-party assets

- Docsify 5.0.0, from the npm package's **`dist/docsify.min.js`** entry; MIT license in `assets/vendor/docsify.LICENSE`. The package's legacy `lib/` directory is not the v5 distribution.
- Manrope variable font from Google Fonts; SIL Open Font License in `assets/site/manrope-LICENSE.txt`.

The custom SVG illustrations are part of this site.
