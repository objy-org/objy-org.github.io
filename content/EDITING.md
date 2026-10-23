# Editing the OBJY website

The website runs on Docsify. You can update its content by editing Markdown files. Routine edits do not require HTML, CSS, JavaScript, or a build command.

## Choose the right file

| What you want to change | File to edit |
| --- | --- |
| Main headline, product description, feature text, bullet points, buttons | [home.md](home.md) |
| Left menu labels, links, and order | [_sidebar.md](../_sidebar.md) |
| Header links, footer, menu text, diagram labels and captions | [labels.md](labels.md) |
| Names and values in the interactive examples | [examples.md](examples.md) |
| Existing technical documentation | [DOCUMENTATION.md](../DOCUMENTATION.md) |

## Change the page copy

Open `home.md` and edit the heading, paragraph, or list you want to change:

```markdown
## Your world. Your object model. :id=objects

> 01 / GIVE IT SHAPE

Describe the things that matter to your application.

- Flexible properties
- Optional types
- Nested structures
```

Keep the `#`, `##`, or `###` at the beginning of a heading. Keep its `:id=...` suffix unchanged so existing links continue to work. The quoted line beginning with `>` becomes the small label above the section heading. You can change its words too.

Use `**bold words**` for emphasis and `*italic words*` for italics. Text wraps automatically. Keep the main `#` headline first; use `##` for the main sections and `###` for smaller headings inside them.

## Change buttons and links

```markdown
[Read the documentation](docs/)

[Explore objects](/?id=objects)
```

The words inside `[]` are the visible label. The destination goes inside `()`. `/?id=objects` jumps to the heading with `:id=objects`. A full address such as `https://example.com` opens another website.

A paragraph containing only links becomes a row of buttons and text links. The first link receives the main button style. Put a link within a sentence if it should remain part of the paragraph.

## Change the left menu

Edit `_sidebar.md`. Each line is an ordinary Markdown link:

```markdown
- [Objects](/?id=objects)
- [Inheritance](/?id=inheritance)
```

Change the words in `[]` to rename an entry. Move lines to change their order. The destination must match a heading ID in `home.md`.

## Add a section

Add a new second-level heading and its content to `home.md`:

```markdown
## Made for your ideas. :id=use-cases

> WHAT YOU CAN BUILD

Write your content here.
```

Choose a unique ID made of lowercase letters and hyphens. Add its menu entry to `_sidebar.md`:

```markdown
- [Use cases](/?id=use-cases)
```

To reorder the page itself, move a section's heading and all its content together. Keep the main hero first. New sections use the text layout automatically. A developer is needed for a new custom illustration or a change to the design.

## Change diagrams and interactive examples

In `labels.md`, find the relevant section and edit the right-hand column. Keep its section headings and the left-hand column unchanged: they identify where each label appears. Keep short labels concise so they fit their illustrations.

In `examples.md`:

- A `##` heading is an example button label.
- Its `###` heading is the object's name.
- The table rows are its properties and values.

You can add or remove property rows. Copy an entire example block to add another example button. Keep at least one example. Escape a literal pipe inside a table cell as `\|` so it does not create an extra column. These examples are illustrations, not a live database.

## Add an image

```markdown
![Describe the image](assets/img/your-image.png)
```

The image file must exist in the repository, or you can use a full image URL. The website automatically fits it to the available space.

## Review and publish

Save your Markdown changes and review the website on desktop and mobile. Check the links. Your Markdown editor's preview shows the words and structure; the website preview shows the final design.

The redesign is currently on `codex/objy-brand-website`. Edits on that branch do not publish to the live website automatically. Submit your Markdown changes through the repository's review and publishing process. A developer can handle previews and releases.
