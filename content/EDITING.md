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
| Feature overview, storage, descriptions, and icons | [home.md](en/home.md) | [home.md](de/home.md) |

Edit the file in the language you want to change. Database, server, and REST API documentation are loaded live from `objy-org/objy`; JavaScript client documentation comes from `objy-org/objy-client`. The shared Markdown includes are listed below.

The switcher at the top right remembers the visitor's choice. A URL with `?lang=de` or `?lang=en` explicitly selects that language. Internal links keep the selected language automatically.

## Change the page copy

Edit the words in `home.md`. Keep the heading's `:id=...` suffix so menu links keep working:

```markdown
## Your world. As objects. :id=object-capabilities

Live references, nested data, vectors, and files.
```

Use `**bold words**`, `*italic words*`, and `[link text](destination)` as usual. Keep the main `#` headline first. Its first standalone image appears below the headline and introduction. Later `##` sections become full-width details. Use `###` for smaller headings within a section.

The homepage tells the story through the large apps, AI agents, and objects illustration, followed by four use cases and the complete feature catalog. Deployment options live on the separate Get Started page. The use cases explain what people can build: AI agents and memory, analytics, application backends, and an open-ended “Or anything else…” option. The homepage Features area contains the overview, storage internals, and the full capability catalog without code examples. Preserve existing `:id=...` values when renaming headings.

The short statements beneath the main headline are an ordinary bullet list in `home.md`. Begin each item with an icon image, then its text: `- ![](assets/site/icons/features/flexible-objects.svg) Flexible JSON`. Icon-led lists in the hero automatically become a centered highlights row, with two columns on smaller screens. Keep each statement short and update both languages.

Edit the use-case heading, descriptions, and icons directly in `home.md`. The section keeps `:id=object-capabilities` so existing links continue to work. Its menu label is Use cases; edit that label in `sidebar.md`.

## Code highlighting

Add a language name immediately after a code block's opening backticks. The site highlights these blocks automatically in local pages and live remote documentation, including tabbed homepage examples when present:

````markdown
```json
{"name": "Alex", "online": true}
```
````

Supported languages include `json`, `js`/`javascript`, `ts`/`typescript`, `sh`/`bash`/`shell`, `http`, `html`, `xml`, `css`, `yaml`/`yml`, and `markdown`/`md`. Use `text` for plain output. Code contents and copied text stay unchanged; no HTML or manual coloring is needed.

## Change links or the menu

```markdown
[Documentation](/documentation.md)
[Use cases](/?id=object-capabilities)
```

The words inside `[]` are the label. The destination goes inside `()`. `/?id=object-capabilities` jumps to the heading with `:id=object-capabilities`.

Deployment content lives in `get-started.md`, opened through the top-bar Get started link at `#/get-started`. It is separate from the homepage. Its three sections are Local, Bring your own cloud, and Embedded. Local contains a shared CLI installation command and two `###` subsections: One node and Cluster. Embedded uses one installation and code example for browsers and Node.js, with a guide link for each platform. Each is an ordinary Markdown section with a title and visible commands or buttons. Its icon appears only beside the matching label in the left menu, like Documentation. Keep an icon in each `##` heading, with a fenced code block or a link-only paragraph/list below it. Use plain `###` headings for subsections; these become indented menu items. You can add explanatory paragraphs before code blocks. The left menu is generated from those headings and jumps to the matching section; no separate menu file is needed. Reordering or adding sections also updates the menu. Link-only bullet lists become buttons. Finish each option with its guide link, and keep the page and chapter IDs so shared links jump to the right section. All titles, code, providers, and destinations stay editable in Markdown. Documentation retains its clickable directory layout.

The homepage’s last area contains the JSON/API overview, storage internals, and all feature cards. Edit these directly in `home.md`. The left-menu Features link jumps to this area; there is no separate Features file. Get Started remains its own page. A Markdown rule (`---`) separates the homepage footer from the full catalog.

A list containing only links becomes a row of action buttons in the hero or a closing section without an illustration. The first link is the primary action. A horizontal rule (`---`) separates a closing section’s footer links. All labels and destinations come from the Markdown.

On the homepage, sections with `###` subheadings and no standalone illustration or tabbed code examples use the options layout. It detects up to four columns on desktop, two on tablets, and one on phones. An icon in each heading appears centered above its title and description. Bullet lists of links become buttons within each option.

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

To add a left-menu icon, put an image with empty alternative text in the heading: `## ![](assets/site/icons/database.svg) Database :id=database`. It appears only in the menu, at the same size as Documentation and Get Started. This also works for subchapters and illustrated guides. Learn uses icons for its Database and Server chapters, with plain text for the topics below them.

Links within a document are relative to its folder. From `guides/setup.md`, `[Next](next.md)` opens `guides/next.md`, and `[Documentation](../documentation.md)` opens the documentation index. Link directly to a chapter with `[Installation](setup.md?id=installation)`. For a link from any page to a top-level document, start with `/`, for example `[Documentation](/documentation.md)`.

Markdown files at the repository root work too. The site first checks the selected language folder, then the default language, then the root. If a new page has no translation yet, readers see its default-language version. The top-left OBJY logo always returns to the homepage in the selected language.

## Manage the documentation index

The top-bar Documentation link opens `content/en/documentation.md` or `content/de/documentation.md`, depending on the selected language. Its entries are Embedded Database, DB Server, REST API, and JavaScript client. [Embedded Database documentation](database.md) loads `DB.md` for browsers and Node.js. [DB Server documentation](server.md) loads `SERVER.md`, [REST API documentation](api.md) loads `API.md`, and [JavaScript client documentation](client.md) loads `README.md` from `objy-org/objy-client`. Keep the JavaScript client last. Deployment links use server documentation: local and cloud setup open `start-one-node`, and cluster setup opens `form-a-cluster`. Browser setup opens `/content/database.md?id=install-in-a-browser`; embedding in Node.js opens `/content/database.md?id=install-in-nodejs`.

To add another guide, add a `##` heading with an icon, a short explanation, and one Markdown link to each language’s index. Keep each explanation and destination in separate paragraphs. The site combines these into one fully clickable row, in Markdown order. The same headings, icons, links, and order also define the persistent left menu. Clicking a guide opens its content and expands its chapters, with the other guide roots still available. The small arrows expand or collapse guides and nested chapters. Chapters come from the loaded Markdown, including live remote sources; no separate navigation file is needed. Direct links open the matching guide and chapter ancestors. Link to an existing local Markdown page, or create a shared page containing a remote include as described below.

An image inside a `##` heading becomes a small chapter icon, for example `## ![](assets/site/icons/database.svg) Database :id=database`. Keep its alternative text empty because the adjacent heading already names the chapter. A directory row with one destination shows that icon, the chapter title, its description, and an arrow. The separate link label stays in the Markdown source but is not repeated on screen. For multiple destinations, use a bullet list containing only links; those labels appear as separate text links under the description. The layout works with any chapter name or number of entries. Pages with additional chapter content keep the ordinary Markdown layout and chapter menu.

## Edit the feature catalog

The left-menu Features link jumps to the Features area in `home.md`. Its `##` headline introduces the JSON/API diagram. The two catalog groups use `###` headings; each individual feature uses an icon-led `####` heading:

```markdown
### Database core :id=database-core

The same engine, embedded in browsers and Node.js.

#### ![](assets/site/icons/features/live-references.svg) Live references, without copies :id=live-references

Connect objects and expand their references when reading.
```

Keep one icon and one short description per feature, with no fenced code examples. Give the icon empty alternative text, because its heading already names the feature. Add the same IDs and icon paths in both languages. Add or edit features directly in this one Markdown file; the renderer builds the responsive card grids automatically.

The JSON/API image belongs directly beneath the Features headline and introduction. The same illustration contains a prominent in-memory panel with three storage blocks. Edit their headings and two short explanation lines in the Storage diagram table of `labels.md`; keep the lines short enough to fit their blocks. The single italic Markdown paragraph after the image is its small, centered caption. Keep it to one sentence; do not add a separate storage text section or second image below the diagram. Illustrated chapter headings sit above their text and image. Spacing and typography separate the chapters; do not add manual divider rules.

The core runs in browsers and Node.js; authentication, files, cluster operation, and durability belong to the server. Keep S3 durability explicitly optional and replication asynchronous. Existing `#/features` bookmarks redirect to the homepage, retaining their chapter IDs.

## Include live documentation

The shared database page, `content/database.md`, contains only a remote include:

```markdown
[Database documentation](https://raw.githubusercontent.com/objy-org/objy/refs/heads/main/DB.md ':include')
```

The source is fetched from GitHub when readers open that page. `content/server.md` loads `SERVER.md` for server and cluster operation. The client page, `content/client.md`, loads the main `README.md` from `objy-org/objy-client`, and `content/api.md` loads `API.md` from `objy-org/objy`. Edit the original files there to update the documentation; no copy or website build is needed. Each left menu follows the source headings automatically. Both website languages currently display the same English sources, while the header and controls keep the selected language.

To use a different source, edit the URL in the matching shared Markdown page. Keep each remote page as a single include so relative Markdown links and images resolve from the remote file. Linked Markdown files also open inside the site with their own chapter menus. The source must be a public raw Markdown URL that allows browser requests. Source caching can delay updates; failed loads show the standard page-unavailable message.

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

Add new `##` chapters after the hero to place full-width content beneath it. Illustrated detail sections alternate text and artwork on desktop and stack on smaller screens.

## Change labels

In `labels.md`, edit the right-hand column. Keep the headings and left-hand column unchanged: they identify where each label appears. The header links use ordinary Markdown links.

The Application diagram table controls the Apps, AI agents, and APIs labels and the central JSON example in the homepage hero. Keep its four JSON lines short and preserve valid JSON punctuation. The Architecture diagram table controls the API labels and three JSON examples in the homepage Features introduction. Device, Person, and Memory rows provide each collection name and its object's fields. Keep JSON punctuation and short labels intact. Desktop and phone layouts share the same translations; shape and layout changes remain developer concerns.

Keep the examples short enough to fit the cards. The person and memory examples have three fields each; the device has four. The storage explanations are inside the diagram. The full feature list follows it on the homepage.

## Edit the homepage use cases

Each use case is a `###` heading with an icon and a short description in `home.md`:

```markdown
## What will you build? :id=object-capabilities

### ![](assets/site/icons/use-cases/agents.svg) AI agents & memory :id=use-case-agents

Store memories and embeddings together. Retrieve relevant context with vector search.
```

Keep all four use cases together for a single desktop row. Their icons are custom SVGs in `assets/site/icons/use-cases/`. Titles and descriptions stay editable in Markdown; the layout handles spacing and smaller screens. Keep the IDs and icon paths consistent across translations.

## Change section images

The opening hero centers a layered object database beneath its headline and icon statements. Smaller apps, AI agents, APIs, and object nodes surround it. It can grow to 1300px; on phones, the endpoint icons move beneath the enlarged database. The four use cases follow the image. The homepage Features area opens with the overlapping JSON architecture diagram; its integrated storage panel is explained directly underneath, without another graphic. Later illustrated chapters alternate text and artwork on desktop and stack on phones.

Change an image's file path to use a different image. The words inside `![]` describe it for people using screen readers. Update that description when replacing the image, and keep the image on its own line.

```markdown
![Describe the image](assets/site/your-image.png)
```

Shared images in `assets/` are relative to the site root. Other relative image paths are resolved from the actual Markdown file, so a guide can keep its images beside it. The file must exist in the repository, or use a full image URL. Images automatically fit the available width. Additional images in the same section stay within its text.

## Add a language

1. Copy `content/en/` to a new folder named after the language code, such as `content/fr/`.
2. Translate `home.md`, `sidebar.md`, `labels.md`, `get-started.md`, `documentation.md`. Translate image descriptions too. Keep all `:id=...` values, label-table headings and left-hand keys, code examples, filenames, and internal link targets unchanged. Translate only the right-hand values in `labels.md`.
3. Add an entry to `content/languages.json`, for example `{ "code": "fr", "name": "Français", "short": "FR" }`. The code must match the folder. The language appears in the switcher automatically; no HTML or JavaScript changes are needed.
4. Preview `/?lang=fr`, `/?lang=fr#/get-started`, `/?lang=fr#/documentation`, and `/?lang=fr#/content/database`. Check the homepage, menu, documentation, diagram text, and mobile layout. Keep diagram labels short enough to fit.
5. Run `node --test tests/*.test.mjs` to check for missing files, labels, anchors, or broken local links.

The registry's `defaultLanguage` controls the default for new visitors. Unknown URL language codes fall back to that default. Missing UI labels also fall back to the default language, but translate every label before releasing a new language. Translate the core files before registering a language. Additional Markdown pages can fall back to the default language until their translations are ready.

Use language-neutral links such as `/content/server.md?id=start-one-node`, `/content/database.md?id=install-in-a-browser`, and `/get-started.md?id=deploy-quick-start` in every translation. Do not link directly to another language folder from page content. Shared heading IDs let the switcher keep readers at the same section in either language.

## Review and publish

Save your Markdown changes, review the website on desktop and mobile, and check the links. Your Markdown editor shows the content; the website preview shows its final appearance.

The redesign is on `codex/objy-brand-website`. That branch does not automatically publish to the live site. Use the repository's review and publishing process; a developer can handle previews and releases.

## Edit Learn

Open `content/en/learn.md` or `content/de/learn.md`. The two `##` chapters are Database and Server. Use simple `###` topic headings beneath them: collections, objects, properties, references, queries, vectors and HNSW, storage, API, users and permissions, clusters, and persistence. Their headings automatically become the left menu, with topics indented beneath their parent chapter. Keep matching `:id=...` values across translations.

The shared guide renderer supports a mixture of illustrated topics and ordinary prose, lists, or code. Keep at least one standalone image in each main chapter. Text and artwork alternate sides on desktop and stack on phones. Headings and whitespace separate the chapters; do not add manual divider lines.

Use the same bike (`bike-01` in `bikes`) and owner Alex (`person-42` in `people`) throughout. The reference example shows `owner.object` as an expanded read view. Collection metadata configures storage rather than becoming fields on the bike. Ownership describes a relationship; user permissions separately control access. Keep S3 persistence explicitly optional and replication asynchronous.

Keep code identical across translations. Image paths and accessible descriptions live in the page Markdown. Diagram labels, names, and illustrated JSON lines live in the Learn diagrams table of `labels.md`; keep their values consistent with the prose and fenced examples. Preserve JSON punctuation.

The top-bar Learn link is translated in the Navigation table of `labels.md`. No separate page registration or chapter-menu file is required.

The Vectors and HNSW topic uses illustrative embeddings on `_vec` and a `$vector` search. Keep `ready()` before the example search. Applications supply embeddings from the same model; the HNSW graphic is a schematic of graph layers, not a plot of the sample numbers. Its query and result labels are in the Learn diagrams table.
