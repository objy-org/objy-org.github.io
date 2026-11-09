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
| Three main advantages and their illustrations | [home.md](en/home.md) | [home.md](de/home.md) |

Edit the file in the language you want to change. Database, server, and REST API documentation are loaded live from `objy-org/objy`; JavaScript client documentation comes from `objy-org/objy-client`. The shared Markdown includes are listed below.

The switcher at the top right remembers the visitor's choice. A URL with `?lang=de` or `?lang=en` explicitly selects that language. Internal links keep the selected language automatically.

## Change the page copy

Edit the words in `home.md`. Keep the heading's `:id=...` suffix so menu links keep working:

```markdown
## Your world. As objects. :id=object-capabilities

Live references, nested data, vectors, and files.
```

Use `**bold words**`, `*italic words*`, and `[link text](destination)` as usual. Keep the main `#` headline first. Its first standalone image appears below the headline and introduction. Later `##` sections become full-width details. Use `###` for smaller headings within a section.

The homepage opens with the large apps, AI agents, and objects illustration. The three main advantages follow immediately: one versatile API, flexible JSON objects, and efficient in-memory storage. Four use cases come next. The Learn link beneath the advantages leads to the full explanation; deployment options stay on Get Started. Preserve existing `:id=...` values when renaming headings.

The short statements beneath the main headline are an ordinary bullet list in `home.md`. Begin each item with an icon image, then its text: `- ![](assets/site/icons/features/flexible-objects.svg) Flexible JSON`. Icon-led lists in the hero automatically become a centered highlights row, with two columns on smaller screens. Keep each statement short and update both languages.

Edit the use-case heading, descriptions, and icons directly in `home.md`. The section keeps `:id=object-capabilities` so existing links continue to work. Its menu label is Use cases; edit that label in `sidebar.md`.

## Code highlighting

Add a language name immediately after a code block's opening backticks. The site highlights these blocks automatically in local pages and live remote documentation:

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

Getting Started uses the same overview and collapsible navigation as Documentation. Edit `content/<language>/get-started.md` for its cloud and local-server icon rows. Each row contains an icon-led `##` heading, a short description, and one Markdown link. Those same links define the left-menu roots; no separate navigation file is needed.

Instructions live in `content/<language>/get-started/local.md` and `cloud.md`. Their headings become chapters beneath the selected root. Clicking the current root collapses or expands its chapters while leaving the guide open. Local includes installation, One node, and Cluster. Cloud is a directory with a Terraform row linking to `/get-started/cloud/terraform.md`. Its localized wrappers include `content/terraform.md`, the shared live Terraform README reference. The menu follows these nested Markdown directories: clicking Cloud opens its overview, and only selecting Terraform loads the README and expands its chapters. Returning to Cloud collapses Terraform again. Edit the README in `objy-org/terraform` to update it; do not copy its content into this repository. The source must be publicly readable. Chapters containing code or starting with a link-only list get the setup layout, and link-only lists become buttons. Keep matching IDs, code, and destinations across translations. To add a path, add its overview row and a localized Markdown guide.

The homepage Features area follows the hero. It uses three illustrated Markdown subchapters with one short paragraph each. Add a standard `<details>` block to a subchapter for an optional example beneath its text and image; keep a blank line around fenced code. The flexible-object example remains editable here, with no separate JavaScript content registry. The left-menu Features link jumps to this area; there is no separate Features file. Use cases and the footer follow it. Get Started remains its own page.

A list containing only links becomes a row of action buttons in the hero or a closing section without an illustration. The first link is the primary action. A horizontal rule (`---`) separates a closing section’s footer links. All labels and destinations come from the Markdown.

On the homepage, sections with `###` subheadings and no standalone illustration use the options layout. It detects up to four columns on desktop, two on tablets, and one on phones. An icon in each heading appears centered above its title and description. Bullet lists of links become buttons within each option.

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

The top-bar Documentation link opens `content/en/documentation.md` or `content/de/documentation.md`, depending on the selected language. Its entries are DB Server, REST API, and JavaScript client. [DB Server documentation](server.md) loads `SERVER.md`, [REST API documentation](api.md) loads `API.md`, and [JavaScript client documentation](client.md) loads `README.md` from `objy-org/objy-client`. Keep the JavaScript client last. Local setup links use server documentation: one node opens `deploy`, and cluster setup opens `clustering`. Cloud setup includes the live Terraform README.

To add another guide, add a `##` heading with an icon, a short explanation, and one Markdown link to each language’s index. Keep each explanation and destination in separate paragraphs for the compact row styling. Additional prose keeps its ordinary Markdown layout and does not remove the menu roots. The site combines these into one fully clickable row, in Markdown order. The same headings, icons, links, and order also define the persistent left menu. Navigation is always derived from Markdown, never from a second JavaScript list. Add, remove, reorder, or rename directory entries there; edit guide headings to change their chapters. On the next navigation or reload, the site rereads these sources and updates the tree. It does not push updates into an already open page. Clicking a guide opens its content and expands its chapters, with the other guide roots still available. The small arrows expand or collapse guides and nested chapters. Chapters come from the loaded Markdown, including live remote sources; no separate navigation file is needed. Direct links open the matching guide and chapter ancestors. Link to an existing local Markdown page, or create a shared page containing a remote include as described below.

An image inside a `##` heading becomes a small chapter icon, for example `## ![](assets/site/icons/database.svg) Database :id=database`. Keep its alternative text empty because the adjacent heading already names the chapter. A directory row with one destination shows that icon, the chapter title, its description, and an arrow. The separate link label stays in the Markdown source but is not repeated on screen. For multiple destinations, use a bullet list containing only links; those labels appear as separate text links under the description. The layout works with any chapter name or number of entries. Pages with additional chapter content keep the ordinary Markdown layout and chapter menu.

## Edit the three main advantages

Edit the `feature-highlights` section in `home.md`. Each advantage is a `###` heading, one short paragraph, and a standalone Markdown image:

```markdown
### One API. Every way to work. :id=versatile-api

CRUD, queries, aggregations, and vector search together.

![The four API operations.](assets/site/architecture.svg#api)
```

The three images reference the same architecture artwork: `#api`, `#objects`, and `#memory`. Keep these image fragments in the order of the story. The text appears beside its corresponding layer on wide layouts and above it on narrow ones. The renderer follows the Markdown subchapters automatically; there is no JavaScript list of titles or fixed chapter count. Use a single short explanation per advantage, without extra badges, boxes, or divider rules.

The last link-only paragraph becomes the subtle Learn link below the entire story. Edit its wording and destination directly in Markdown. The four use cases follow this section. Keep matching IDs and image paths in both languages.

Short labels inside the SVG are still managed by the Architecture diagram and Storage diagram tables in `labels.md`. JSON is unframed, and the three memory chips keep short labels. The longer explanations belong in the Markdown outside the image. The complete database runs on the server, including storage, authentication, files, clustering, and optional durability. Application examples use REST or `@objy/client` to connect to that server. Learn provides the deeper technical explanation. Existing `#/features` bookmarks still open the homepage Features area.

## Include live documentation

The shared server page, `content/server.md`, contains only a remote include:

```markdown
[Server documentation](https://raw.githubusercontent.com/objy-org/objy/refs/heads/main/SERVER.md ':include')
```

The source is fetched from GitHub when readers open that page. `content/server.md` loads `SERVER.md` for server and cluster operation. The client page, `content/client.md`, loads the main `README.md` from `objy-org/objy-client`, and `content/api.md` loads `API.md` from `objy-org/objy`. Edit the original files there to update the documentation; no copy or website build is needed. Each left menu follows the source headings automatically. Both website languages currently display the same English sources, while the header and controls keep the selected language.

To use a different source, edit the URL in the matching shared Markdown page. Keep each remote page as a single include so relative Markdown links and images resolve from the remote file. Linked Markdown files also open inside the site with their own chapter menus. When opened from a directory guide, remote links retain that parent tree, including after reloads and language changes. The source must be a public raw Markdown URL that allows browser requests. The source is revalidated when the page is opened or reloaded; an already open page does not receive pushed updates. GitHub caching can delay updates. Failed loads show the standard page-unavailable message, with no saved-content fallback. Keep external documentation as references; do not paste or snapshot it into the website repository.

Standalone includes can also share a local Markdown file. Both `get-started/cloud/terraform.md` translations contain `[Terraform](../../../terraform.md ':include')`, resolving from the wrapper file to `content/terraform.md`. That shared file contains only the remote README reference, so there is no copied documentation. Its chapter tree follows the fetched source. While the repository is private, the reader shows the standard unavailable message; it can load as soon as that source becomes publicly readable.

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

The Application diagram table controls the Apps, AI agents, and APIs labels in the homepage hero. Its four JSON rows are retained for the preserved layered-object version at `assets/site/applications-objects.svg`. The active symmetric version at `assets/site/applications-objects-scale.svg` shows hundreds of empty object brackets instead of JSON fields. The wider asymmetric experiment remains saved at `assets/site/applications-objects-chaos.svg`. The Architecture diagram table controls the four API labels and single JSON example in the homepage Features introduction. Its Object rows provide the collection name and JSON fields. Keep JSON punctuation and short labels intact. Desktop and phone layouts share the same translations; shape and layout changes remain developer concerns.

Keep illustrated JSON fields and diagram labels short enough to fit. The three main advantages link to Learn for more detail.

## Edit the homepage use cases

Each use case is a `###` heading with an icon and a short description in `home.md`:

```markdown
## What will you build? :id=object-capabilities

### ![](assets/site/icons/use-cases/agents.svg) AI agents & memory :id=use-case-agents

Store memories and embeddings together. Retrieve relevant context with vector search.
```

Keep all four use cases together for a single desktop row. Their icons are custom SVGs in `assets/site/icons/use-cases/`. Titles and descriptions stay editable in Markdown; the layout handles spacing and smaller screens. Keep the IDs and icon paths consistent across translations.

## Change section images

The opening hero uses the first symmetric field of 376 empty object brackets, connected to Apps, AI agents, and APIs. It can grow to 1300px; on phones, the icons sit beneath the field. To restore the saved wider asymmetric version, change the hero image path from `assets/site/applications-objects-scale.svg` to `assets/site/applications-objects-chaos.svg`. The original layered object remains at `assets/site/applications-objects.svg`. Update both localized `home.md` files and their image descriptions. All three SVGs remain unchanged. The three main advantages follow the hero, then the four use cases. The architecture image is split into three reusable layers referenced as `architecture.svg#api`, `#objects`, and `#memory`. Each layer sits beside its Markdown headline and explanation. The three memory chips retain short labels inside the artwork. Later illustrated chapters alternate text and artwork on desktop and stack on phones.

Change an image's file path to use a different image. The words inside `![]` describe it for people using screen readers. Update that description when replacing the image, and keep the image on its own line.

```markdown
![Describe the image](assets/site/your-image.png)
```

Shared images in `assets/` are relative to the site root. Other relative image paths are resolved from the actual Markdown file, so a guide can keep its images beside it. The file must exist in the repository, or use a full image URL. Images automatically fit the available width. Additional images in the same section stay within its text.

## Add a language

1. Copy `content/en/` to a new folder named after the language code, such as `content/fr/`.
2. Translate `home.md`, `sidebar.md`, `labels.md`, `learn.md`, `get-started.md`, `documentation.md`. Translate image descriptions too. Keep all `:id=...` values, label-table headings and left-hand keys, code examples, filenames, and internal link targets unchanged. Translate only the right-hand values in `labels.md`.
3. Add an entry to `content/languages.json`, for example `{ "code": "fr", "name": "Français", "short": "FR" }`. The code must match the folder. The language appears in the switcher automatically; no HTML or JavaScript changes are needed.
4. Preview `/?lang=fr`, `/?lang=fr#/get-started`, `/?lang=fr#/documentation`, and `/?lang=fr#/content/server`. Check the homepage, menu, documentation, diagram text, and mobile layout. Keep diagram labels short enough to fit.
5. Run `node --test tests/*.test.mjs` to check for missing files, labels, anchors, or broken local links.

The registry's `defaultLanguage` controls the default for new visitors. Unknown URL language codes fall back to that default. Missing UI labels also fall back to the default language, but translate every label before releasing a new language. Translate the core files before registering a language. Additional Markdown pages can fall back to the default language until their translations are ready.

Use language-neutral links such as `/content/server.md?id=deploy`, `/content/api.md?id=collections`, and `/get-started/local.md?id=deploy-quick-start` in every translation. Do not link directly to another language folder from page content. Shared heading IDs let the switcher keep readers at the same section in either language.

## Review and publish

Save your Markdown changes, review the website on desktop and mobile, and check the links. Your Markdown editor shows the content; the website preview shows its final appearance.

Preview changes locally. Publishing through the GitHub Pages branch requires an explicit request; do not automatically commit or push editorial changes.

## Edit Learn

Open `content/en/learn.md` or `content/de/learn.md`. The two `##` chapters are Database and Server. Use simple `###` topic headings beneath them: collections, objects, properties, references, CRUD, queries, vectors and HNSW, storage, API, users and permissions, clusters, and persistence. Their headings automatically become the left menu, with topics indented beneath their parent chapter. CRUD and Queries are sibling `###` topics, with CRUD first. Use `####` for deeper subsections when needed; the menu adds another indentation level automatically. Keep matching `:id=...` values across translations.

The shared guide renderer supports a mixture of illustrated topics and ordinary prose, lists, or code. Keep at least one standalone image in each main chapter. Wide layouts pair the explanation with its illustration or a direct code block. They stack as soon as the article becomes too narrow for readable diagrams. Headings and whitespace separate the chapters; do not add manual divider lines. Optional examples go in `<details>` with a short `<summary>` and blank lines around the fenced code. The guide places these controls beneath the illustration; they open in place without changing the diagram’s size.

Use the same bike (`bike-01` in `bikes`) and owner Alex (`person-42` in `people`) throughout. The reference example shows `owner.object` as an expanded read view. Collection metadata configures storage rather than becoming fields on the bike. Ownership describes a relationship; user permissions separately control access. Keep S3 persistence explicitly optional and replication asynchronous.

Keep code identical across translations. Image paths and accessible descriptions live in the page Markdown. Diagram labels, names, and illustrated JSON lines live in the Learn diagrams table of `labels.md`; keep their values consistent with the prose and fenced examples. Preserve JSON punctuation.

The top-bar Learn link is translated in the Navigation table of `labels.md`. No separate page registration or chapter-menu file is required.

The Vectors and HNSW topic uses illustrative embeddings on `_vec` and a `$vector` search through the server client. Explain that the server can return `503` while its vector index warms; callers retry after it is ready. Applications supply embeddings from the same model; the HNSW graphic is a schematic of graph layers, not a plot of the sample numbers. Its query and result labels are in the Learn diagrams table.

Application examples connect to a running server through `@objy/client`. Keep the initial client connection and administrator login in the Collections example, then reuse its `app` and `bikes` handles in the later lessons. Collection metadata goes through the HTTP API or the client’s `setMeta()` method.
