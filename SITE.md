# OBJY website

A Docsify 5 site with a dark theme, a simple top header, and section navigation fixed to the far left edge. OBJY is the brand; **objy.db and its object-centric database features are the focus**. The homepage explains the database through a concrete package example and uses a warm illustration of everyday things. There is no build step.

## Editing

See [the staff editing guide](content/EDITING.md).

| File | Content |
| --- | --- |
| `content/home.md` | Hero headline and illustration, database introduction, feature explanations, links |
| `_sidebar.md` | Section menu labels, destinations, and ordering |
| `content/labels.md` | Header links, navigation labels, browser metadata |
| `DOCUMENTATION.md` and existing documentation files | Existing technical documentation |

Use ordinary Markdown. Preserve Docsify's `:id=...` suffixes when renaming headings. A new `##` heading creates a section; add a link in `_sidebar.md` to include it in the menu. Routine editorial changes require no HTML, CSS, or JavaScript.

## Implementation

`index.html` loads the custom theme in `assets/site/site.css`, configuration and layout hooks in `assets/site/site.js`, and the pinned Docsify distribution in `assets/vendor/docsify.min.js`.

Docsify renders the Markdown, manages the sidebar, and handles routes. The theme arranges its rendered HTML into the hero and sections, moves its native sidebar into the layout, and binds labels from Markdown tables using Docsify's bundled parser. The mobile menu and active-section indication are supplied by the theme.

The first standalone image in the hero's Markdown becomes its illustration. `assets/site/objects-world.png` is the generated, transparent hero artwork; its alternative text and file path are editable in `content/home.md`. The image presents real-world things without technical connectors or database diagrams. Layout and artwork design remain developer concerns.

Only trusted repository Markdown is rendered. Add sanitization before accepting untrusted page submissions.

Browser metadata updates from `content/labels.md`; clients that do not execute JavaScript use the fallback tags in `index.html`. Sync those tags when social-preview metadata changes. Loading/no-JavaScript messages and the OBJY wordmark also remain in the shell.

## Local preview

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. HTTP is required for Docsify to load Markdown. Fonts, artwork, and the homepage engine are all local, with no package installation required.

## Routes

Sections use standard Docsify URLs such as `/#/?id=objects`. Earlier plain links such as `/#objects` are translated automatically. The removed `the-idea` and `start-building` entry URLs redirect to the hero and objy.db introduction respectively.

Other Markdown routes, including `/#/PLATFORM`, still render in the same shell. Links beginning with `docs/` open the existing documentation reader directly. Those documentation files remain separate from the new database-focused landing page.

## Third-party assets

- Docsify 5.0.0, npm package entry `dist/docsify.min.js`, MIT license in `assets/vendor/docsify.LICENSE`.
- Montserrat Regular and SemiBold from Google Fonts, SIL Open Font License in `assets/site/montserrat-LICENSE.txt`.

The hero artwork was generated with the built-in image-generation tool for this site. Its source prompt and file details are recorded in `assets/site/ARTWORK.md`.
