# Editing the OBJY website

The website runs on Docsify. Routine content changes only require Markdown, with no build command.

All translated copy lives under `content/`, grouped by language. English is in `content/en/`; German is in `content/de/`.

| What to change | English | German |
| --- | --- | --- |
| Headlines, section copy, images, links | [home.md](en/home.md) | [home.md](de/home.md) |
| Homepage menu labels and order | [sidebar.md](en/sidebar.md) | [sidebar.md](de/sidebar.md) |
| Header, controls, metadata, diagram labels | [labels.md](en/labels.md) | [labels.md](de/labels.md) |
| Get started and deployment options | [get-started.md](en/get-started.md) | [get-started.md](de/get-started.md) |
| Documentation index | [documentation.md](en/documentation.md) | [documentation.md](de/documentation.md) |

Edit the file in the language you want to change. Server, client, and API documentation are loaded live from the database repository through the shared Markdown includes listed below.

The switcher at the top right remembers the visitor's choice. A URL with `?lang=de` or `?lang=en` explicitly selects that language. Internal links keep the selected language automatically.

## Change the page copy

Edit the words in `home.md`. Keep the heading's `:id=...` suffix so menu links keep working:

```markdown
## More than JSON. :id=abstract-objects

Give anything a shape with flexible properties.
```

Use `**bold words**`, `*italic words*`, and `[link text](destination)` as usual. Keep the main `#` headline first. Consecutive `##` sections with standalone images immediately after the hero create the feature grid. The first section without an illustration starts the full-width details; later illustrated sections stay full-width. This structure controls the grouping, rather than a fixed feature count. Use `###` for smaller headings within a section.

Keep each section focused on one idea and use concrete examples. The four feature sections cover object features, the API, deployment, and built-in users and access control. The interactive object example follows them, then Storage internals and a closing Quick Start section. Preserve their `:id=...` values when renaming headings. Illustrated detail sections alternate text and artwork automatically on desktop; their names do not control the layout.

## Code highlighting

Add a language name immediately after a code block's opening backticks. The site highlights these blocks automatically in local pages and live remote documentation, including the homepage's example tabs:

````markdown
```json
{"name": "Alex", "online": true}
```
````

Supported languages include `json`, `js`/`javascript`, `ts`/`typescript`, `sh`/`bash`/`shell`, `http`, `html`, `xml`, `css`, `yaml`/`yml`, and `markdown`/`md`. Use `text` for plain output. Code contents and copied text stay unchanged; no HTML or manual coloring is needed.

## Change links or the menu

```markdown
[Documentation](/documentation.md)
[More than JSON](/?id=abstract-objects)
```

The words inside `[]` are the label. The destination goes inside `()`. `/?id=abstract-objects` jumps to the heading with `:id=abstract-objects`.

The top-bar Get started now link opens `get-started.md`. This page contains the deployment options previously shown on the homepage: Quick-start, Bring your own cloud, and Browser. Each `##` heading becomes an entry in its automatic left menu. Quick-start combines local and cluster deployment, with GitHub, Run locally, and Cluster setup links. Run locally opens the live server guide at Quick Start; Cluster setup opens Run a Cluster. All copy and destinations are editable in Markdown. Keep the page and chapter IDs so shared links continue to work.

A list containing only links becomes a row of action buttons in the hero or a closing section without an illustration. The first link is the primary action. A horizontal rule (`---`) separates a closing section’s footer links. All labels and destinations come from the Markdown.

On the homepage, sections with `###` subheadings and no standalone illustration or tabbed code examples use the options layout: three columns on desktop, stacked on smaller screens. Bullet lists of links become buttons within each option.

In `sidebar.md`, change homepage menu labels or move lines to change the menu order. To reorder page content, move a heading and the content below it together in `home.md`.

## Add and link Markdown pages

Create a Markdown file in the language folder, such as `content/en/guides/setup.md`. Add its translation at the same path under `content/de/`. Then link to it from the homepage using ordinary Markdown:

```markdown
[Setup guide](guides/setup.md)
[Documentation](documentation.md)
```

The page opens with the same header and layout. Its left menu is generated automatically from its headings:

```markdown
# Setup guide

A short introduction.

## Installation :id=installation

Installation instructions.

### Configuration :id=configuration

Configuration instructions.

## Run a node :id=run-a-node

Start your database.
```

Use `#` for the page title, `##` for chapters, and `###` for subchapters. You do not need to edit `sidebar.md` or any code for these pages. IDs are optional; Docsify creates them from heading text. Explicit IDs are useful for links and should stay the same across translations.

Links within a document are relative to its folder. From `guides/setup.md`, `[Next](next.md)` opens `guides/next.md`, and `[Documentation](../documentation.md)` opens the documentation index. Link directly to a chapter with `[Installation](setup.md?id=installation)`. For a link from any page to a top-level document, start with `/`, for example `[Documentation](/documentation.md)`.

Markdown files at the repository root work too. The site first checks the selected language folder, then the default language, then the root. If a new page has no translation yet, readers see its default-language version. The top-left OBJY logo always returns to the homepage in the selected language.

## Manage the documentation index

The top-bar Documentation link opens `content/en/documentation.md` or `content/de/documentation.md`, depending on the selected language. These Markdown files list the available guides: Server documentation links to [the shared server page](server.md), JavaScript client documentation links to [the shared client page](client.md), and API documentation links to [the shared API page](api.md). Browser documentation links directly to the README’s Run in a Browser chapter at `/content/server.md?id=run-in-a-browser`.

To add another guide, add a `##` heading, a short explanation, and a Markdown link to each language’s index. Each heading appears in the left menu automatically. Link to an existing local Markdown page, or create a shared page containing a remote include as described below.

An image inside a `##` heading becomes a small chapter icon, for example `## ![](assets/site/icons/server.svg) Server :id=server`. Keep its alternative text empty because the adjacent heading already names the chapter. The guide link after the description receives an accent color and arrow automatically. The icons and styling work with any chapter name.

## Include live documentation

The server page, `content/server.md`, contains only a remote include:

```markdown
[Server documentation](https://raw.githubusercontent.com/objy-org/objy.db/refs/heads/main/README.md ':include')
```

The README is fetched from GitHub when readers open Server documentation. The client page, `content/client.md`, uses the same pattern to load `client/README.md` from the database repository, and `content/api.md` loads `API.md`. Edit the original files there to update the documentation; no copy or website build is needed. Each left menu follows the source headings automatically. Both website languages currently display the same English sources, while the header and controls keep the selected language.

To use a different source, edit the URL in `content/server.md`. Keep each remote page as a single include so relative Markdown links and images resolve from the remote file. Linked Markdown files also open inside the site with their own chapter menus. The source must be a public raw Markdown URL that allows browser requests. Source caching can delay updates; failed loads show the standard page-unavailable message.

## Add a homepage section

Add a `##` heading with a unique ID made of lowercase letters and hyphens:

```markdown
## Your new section :id=new-section

A short description.
```

Then add its menu entry to `sidebar.md`:

```markdown
- [Your new section](/?id=new-section)
```

Keep the illustrated feature sections together immediately after the hero. Append new `##` sections after those to add full-width content below it. On narrower screens, the columns and each section’s text and image stack vertically.

## Change labels

In `labels.md`, edit the right-hand column. Keep the headings and left-hand column unchanged: they identify where each label appears. The header links use ordinary Markdown links.

The Application diagram table controls the Apps, AI agents, and APIs labels in the hero illustration. The Object diagram table controls both JSON objects, collection names, and the reference label in the objects illustration. Keep Reference value and Target identity matched, and keep Reference collection matched with Target collection. Keep these lines short so they fit and preserve the JSON punctuation. The Storage diagram table controls the labels and JSON example in the larger 3D storage illustration. The API diagram table controls the short operation labels in the Simple API illustration. The scalability illustration has no editable labels. Their shapes, colors, and layout are managed separately by a developer.

The storage section’s S3 callout is an ordinary Markdown blockquote below the three bullets in `home.md`; its first paragraph is bold. The accompanying Persist, Recover, and optional S3 labels live in the Storage diagram table. Keep S3 durability explicitly optional in both the callout and illustration when editing them.

## Edit the interactive object example

The object example lives in `home.md`, under `:id=object-capabilities`. It shows one code window with tabs above it. Each tab comes from a `###` heading followed by an optional source-label quote and one fenced code block:

````markdown
### Device :id=example-device

> app / devices / drone-01

```json
{
  "_id": "drone-01",
  "name": "Survey drone"
}
```
````

Keep at least two examples. To add another tab, add another `###` heading and code block in the same section. The heading names the tab, and the quote labels the code window. Keep explanations in the section introduction; each tab contains only its quote and code. Copy always copies the selected example. No JavaScript changes are needed to edit the examples or add another tab.

Keep tab IDs consistent across translations, and keep code samples identical. Link directly to a tab with `/?id=example-memory`, for instance. These are illustrative examples and do not send requests to a database. The Query and Aggregation tabs use the JavaScript client and assume it is already authenticated. Use a `js` code fence for client operations and `json` for object data; the code window updates its format label automatically. The AI memory example shows `_vec` on insert; OBJY indexes it separately and hides it from ordinary reads. The file example shows a stored object after upload; the server creates its `_file` descriptor and key.

## Change section images

Each feature has a standalone image in `home.md`. The four features form two rows of two columns on desktop and tablets, and one column on phones, with each text block above its image. After the interactive object example, the storage section uses text beside a larger image. Narrower screens stack the columns and section content vertically in Markdown order. The opening hero centers the apps, AI agents, and APIs illustration above its headline.

Change an image's file path to use a different image. The words inside `![]` describe it for people using screen readers. Update that description when replacing the image, and keep the image on its own line.

```markdown
![Describe the image](assets/site/your-image.png)
```

Shared images in `assets/` are relative to the site root. Other relative image paths are resolved from the actual Markdown file, so a guide can keep its images beside it. The file must exist in the repository, or use a full image URL. Images automatically fit the available width. Additional images in the same section stay within its text.

## Add a language

1. Copy `content/en/` to a new folder named after the language code, such as `content/fr/`.
2. Translate `home.md`, `sidebar.md`, `labels.md`, `get-started.md`, and `documentation.md`. Translate image descriptions too. Keep all `:id=...` values, label-table headings and left-hand keys, code examples, filenames, and internal link targets unchanged. Translate only the right-hand values in `labels.md`.
3. Add an entry to `content/languages.json`, for example `{ "code": "fr", "name": "Français", "short": "FR" }`. The code must match the folder. The language appears in the switcher automatically; no HTML or JavaScript changes are needed.
4. Preview `/?lang=fr`, `/?lang=fr#/get-started`, `/?lang=fr#/documentation`, and `/?lang=fr#/content/server`. Check the homepage, menu, documentation, diagram text, and mobile layout. Keep diagram labels short enough to fit.
5. Run `node --test tests/*.test.mjs` to check for missing files, labels, anchors, or broken local links.

The registry's `defaultLanguage` controls the default for new visitors. Unknown URL language codes fall back to that default. Missing UI labels also fall back to the default language, but translate every label before releasing a new language. Translate the core files before registering a language. Additional Markdown pages can fall back to the default language until their translations are ready.

Use language-neutral links such as `/content/server.md?id=quick-start` and `/get-started.md?id=deploy-quick-start` in every translation. Do not link directly to another language folder from page content. Shared heading IDs let the switcher keep readers at the same section in either language.

## Review and publish

Save your Markdown changes, review the website on desktop and mobile, and check the links. Your Markdown editor shows the content; the website preview shows its final appearance.

The redesign is on `codex/objy-brand-website`. That branch does not automatically publish to the live site. Use the repository's review and publishing process; a developer can handle previews and releases.
