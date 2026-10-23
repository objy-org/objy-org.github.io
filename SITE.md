# OBJY website

The landing page introduces OBJY as the brand and objy.db as its first product. It is a static, buildless site suitable for the existing GitHub Pages setup. The existing technical documentation remains under `docs/`.

## Edit the page

Edit `content/home.md` for the hero, product introduction, feature sections, and calls to action. Each section begins with a small metadata comment:

```markdown
<!-- section: objects; nav: Objects; eyebrow: 01 / GIVE IT SHAPE; visual: objects -->

## Your world.<br>Your object model.

Write ordinary Markdown here.
```

- `section` is the unique anchor used for links. Keep it stable when changing a heading.
- `nav` is the label automatically added to the left menu.
- `eyebrow` is the small line above the heading.
- `visual` selects a diagram from `assets/site/site.js`. Omit it for a text-only section.
- The first section is the hero. Remaining sections appear in order in both the page and navigation.
- A paragraph containing only links becomes a row of calls to action.

Styling lives in `assets/site/site.css`. Diagrams and the illustrative object selector live in `assets/site/site.js`; the hero artwork is `assets/site/object-universe.svg`. Example values in the diagrams illustrate concepts, not an executable database session. Site copy and diagrams are based on the capabilities described in `DOCUMENTATION.md`.

Only trusted repository Markdown is rendered. Do not use this renderer for untrusted user input without adding HTML sanitization.

## Local preview

From this repository:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000`. Serve the files over HTTP; opening `index.html` directly cannot fetch the Markdown file. No package installation or build step is required. The landing page's parser, font, styles, and diagrams are all served locally.

## Documentation and existing links

The `docs/` site continues to use Docsify. Its default page loads this repository's `DOCUMENTATION.md`. Root Docsify hash routes such as `/#/PLATFORM` are redirected into the documentation reader, whose base path points to the original root Markdown files.

The product name is `objy.db`; the documented npm package remains `objy`. Update the install text when that package name changes.

## Third-party assets

- Marked 15.0.12, vendored from the published npm package; MIT license in `assets/vendor/marked.LICENSE.md`.
- Manrope variable font, from the Google Fonts repository; SIL Open Font License in `assets/site/manrope-LICENSE.txt`.

The custom SVG illustrations are part of this site.
