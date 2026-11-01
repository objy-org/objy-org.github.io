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
| Feature catalog, descriptions, and icons | [features.md](en/features.md) | [features.md](de/features.md) |

Edit the file in the language you want to change. Database, server, and REST API documentation are loaded live from `objy-org/objy`; JavaScript client documentation comes from `objy-org/objy-client`. The shared Markdown includes are listed below.

The switcher at the top right remembers the visitor's choice. A URL with `?lang=de` or `?lang=en` explicitly selects that language. Internal links keep the selected language automatically.

## Change the page copy

Edit the words in `home.md`. Keep the heading's `:id=...` suffix so menu links keep working:

```markdown
## Your world. As objects. :id=object-capabilities

Live references, nested data, vectors, and files.
```

Use `**bold words**`, `*italic words*`, and `[link text](destination)` as usual. Keep the main `#` headline first. Its first standalone image appears below the headline and introduction. Later `##` sections become full-width details. Use `###` for smaller headings within a section.

The homepage tells the story through the large apps, AI agents, and objects illustration, followed by four use cases and three compact feature highlights. Deployment options live on the separate Get Started page. The use cases explain what people can build: AI agents and memory, analytics, application backends, and an open-ended “Or anything else…” option. The separate Features page contains the full capability catalog without code examples. Preserve existing `:id=...` values when renaming headings.

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

Deployment content lives in `get-started.md`, opened through the top-bar Get started link at `#/get-started`. It is separate from the homepage. Its five deployment options are Run locally, Run a cluster, Bring your own cloud, Run in the browser, and Embed in Node.js. Each is an expandable row with a large colored icon and title; its commands or buttons appear directly underneath when opened. Keep an icon in each `##` heading, then start its content with a fenced code block or a link-only paragraph/list. This Markdown structure enables the accordion without a chapter menu. Link-only bullet lists become buttons. Finish each option with its guide link, and keep the page and chapter IDs so shared links open the right row. All titles, code, providers, and destinations stay editable in Markdown. Documentation retains its clickable directory layout.

The homepage’s last section shows three feature highlights, edited directly in `home.md`: efficient storage, powerful operations, and application essentials. Each uses the same icon-led `###` pattern as the use cases. Keep the closing `[Explore all features →](/features.md)` paragraph after the three descriptions; it appears as a quiet link below the full row. A Markdown rule (`---`) separates the footer links from the cards. The homepage does not load the deployment file or the full feature catalog.

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

Links within a document are relative to its folder. From `guides/setup.md`, `[Next](next.md)` opens `guides/next.md`, and `[Documentation](../documentation.md)` opens the documentation index. Link directly to a chapter with `[Installation](setup.md?id=installation)`. For a link from any page to a top-level document, start with `/`, for example `[Documentation](/documentation.md)`.

Markdown files at the repository root work too. The site first checks the selected language folder, then the default language, then the root. If a new page has no translation yet, readers see its default-language version. The top-left OBJY logo always returns to the homepage in the selected language.

## Manage the documentation index

The top-bar Documentation link opens `content/en/documentation.md` or `content/de/documentation.md`, depending on the selected language. Its entries are Embedded Database, DB Server, REST API, and JavaScript client. [Embedded Database documentation](database.md) loads `DB.md` for browsers and Node.js. [DB Server documentation](server.md) loads `SERVER.md`, [REST API documentation](api.md) loads `API.md`, and [JavaScript client documentation](client.md) loads `README.md` from `objy-org/objy-client`. Keep the JavaScript client last. Deployment links use server documentation: local and cloud setup open `start-one-node`, and cluster setup opens `form-a-cluster`. Browser setup opens `/content/database.md?id=install-in-a-browser`; embedding in Node.js opens `/content/database.md?id=install-in-nodejs`.

To add another guide, add a `##` heading with an icon, a short explanation, and one Markdown link to each language’s index. Keep each explanation and destination in separate paragraphs. The site combines these into one fully clickable row, in Markdown order. The index hides the chapter menu; individual guides still generate theirs automatically. Link to an existing local Markdown page, or create a shared page containing a remote include as described below.

An image inside a `##` heading becomes a small chapter icon, for example `## ![](assets/site/icons/database.svg) Database :id=database`. Keep its alternative text empty because the adjacent heading already names the chapter. A directory row with one destination shows that icon, the chapter title, its description, and an arrow. The separate link label stays in the Markdown source but is not repeated on screen. For multiple destinations, use a bullet list containing only links; those labels appear as separate text links under the description. The layout works with any chapter name or number of entries. Pages with additional chapter content keep the ordinary Markdown layout and chapter menu.

## Edit the feature catalog

The top-bar Features link opens `features.md`. It separates the shared database core from DB server features. Each feature is a `###` heading with its own icon, followed by its description:

```markdown
## Database core :id=database-core

The same engine, embedded in browsers and Node.js.

### ![](assets/site/icons/features/live-references.svg) Live references, without copies :id=live-references

Connect objects and expand their references when reading.
```

Use `##` for groups and `###` for individual features. Give each feature one icon with empty alternative text, because its heading already provides the label. This pattern creates a responsive grid of compact feature cards automatically, on any local Markdown page. The left menu lists Storage Internals, Database Core, and DB Server, without listing individual features. Each feature keeps its ID for direct links. Titles, descriptions, order, and icon paths all come from Markdown. Add the same IDs and icon paths in both languages. If a group contains a feature without an icon or without content, the page keeps its ordinary document layout.

The architecture diagram appears directly beneath the page title and introduction. Put its standalone image before the first `##` heading to show it without an extra heading or menu entry. A chapter heading followed only by its standalone image still makes a full-width illustrated chapter. The first chapter contains the original storage explanation and layered illustration from the homepage. Edit its heading, paragraph, three bullet points, optional S3 durability note, and image description directly in `features.md`. The graphic’s labels and sample object are centralized in the Storage diagram table of `labels.md`. Keep S3 durability explicitly optional.

Each main `##` chapter gets generous vertical space and a consistent heading. Illustrated chapter headings sit above both the text and image. Spacing and typography separate the chapters automatically; do not add manual horizontal rules between them.

Keep this page concise: one short description per feature, without fenced code examples. Link readers to the core or server documentation for implementation details.

Keep capabilities in the correct group: the core runs in browsers and Node.js; authentication, files, cluster operation, and durability belong to the server. Keep S3 durability explicitly optional and replication asynchronous.

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

The Application diagram table controls the Apps, AI agents, and APIs labels and the central JSON example in the homepage hero. Keep its four JSON lines short and preserve valid JSON punctuation. The Architecture diagram table controls the API labels and three JSON examples in the Features introduction. Device, Person, and Memory rows provide each collection name and its object's fields. Keep JSON punctuation and short labels intact. Desktop and phone layouts share the same translations; shape and layout changes remain developer concerns.

Keep the examples short enough to fit the cards. The person and memory examples have three fields each; the device has four. Use the full Features page for explanations of storage and other capabilities.

## Edit the homepage use cases

Each use case is a `###` heading with an icon and a short description in `home.md`:

```markdown
## What will you build? :id=object-capabilities

### ![](assets/site/icons/use-cases/agents.svg) AI agents & memory :id=use-case-agents

Store memories and embeddings together. Retrieve relevant context with vector search.
```

Keep all four use cases together for a single desktop row. Their icons are custom SVGs in `assets/site/icons/use-cases/`. Titles and descriptions stay editable in Markdown; the layout handles spacing and smaller screens. Keep the IDs and icon paths consistent across translations.

## Change section images

The opening hero centers a layered object database beneath its headline and icon statements. Smaller apps, AI agents, APIs, and object nodes surround it. It can grow to 1300px; on phones, the endpoint icons move beneath the enlarged database. The four use cases follow the image. The Features page opens with the overlapping JSON architecture diagram; storage internals follows with its original graphic. Later illustrated chapters alternate text and artwork on desktop and stack on phones.

Change an image's file path to use a different image. The words inside `![]` describe it for people using screen readers. Update that description when replacing the image, and keep the image on its own line.

```markdown
![Describe the image](assets/site/your-image.png)
```

Shared images in `assets/` are relative to the site root. Other relative image paths are resolved from the actual Markdown file, so a guide can keep its images beside it. The file must exist in the repository, or use a full image URL. Images automatically fit the available width. Additional images in the same section stay within its text.

## Add a language

1. Copy `content/en/` to a new folder named after the language code, such as `content/fr/`.
2. Translate `home.md`, `sidebar.md`, `labels.md`, `get-started.md`, `documentation.md`, and `features.md`. Translate image descriptions too. Keep all `:id=...` values, label-table headings and left-hand keys, code examples, filenames, and internal link targets unchanged. Translate only the right-hand values in `labels.md`.
3. Add an entry to `content/languages.json`, for example `{ "code": "fr", "name": "Français", "short": "FR" }`. The code must match the folder. The language appears in the switcher automatically; no HTML or JavaScript changes are needed.
4. Preview `/?lang=fr`, `/?lang=fr#/get-started`, `/?lang=fr#/documentation`, and `/?lang=fr#/content/database`. Check the homepage, menu, documentation, diagram text, and mobile layout. Keep diagram labels short enough to fit.
5. Run `node --test tests/*.test.mjs` to check for missing files, labels, anchors, or broken local links.

The registry's `defaultLanguage` controls the default for new visitors. Unknown URL language codes fall back to that default. Missing UI labels also fall back to the default language, but translate every label before releasing a new language. Translate the core files before registering a language. Additional Markdown pages can fall back to the default language until their translations are ready.

Use language-neutral links such as `/content/server.md?id=start-one-node`, `/content/database.md?id=install-in-a-browser`, and `/get-started.md?id=deploy-quick-start` in every translation. Do not link directly to another language folder from page content. Shared heading IDs let the switcher keep readers at the same section in either language.

## Review and publish

Save your Markdown changes, review the website on desktop and mobile, and check the links. Your Markdown editor shows the content; the website preview shows its final appearance.

The redesign is on `codex/objy-brand-website`. That branch does not automatically publish to the live site. Use the repository's review and publishing process; a developer can handle previews and releases.
