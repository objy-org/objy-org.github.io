# Editing the OBJY website

The website runs on Docsify. Routine content changes only require Markdown, with no build command.

| What to change | File |
| --- | --- |
| Headline, section explanations, image paths, links | [home.md](home.md) |
| Left menu labels, links, and order | [_sidebar.md](../_sidebar.md) |
| Header links, navigation labels, page title, description, and diagram labels | [labels.md](labels.md) |
| Database documentation | [DATABASE.md](../DATABASE.md) |

## Change the page copy

Edit the words in `home.md`. Keep the heading's `:id=...` suffix so menu links keep working:

```markdown
## JSON objects :id=abstract-objects

Give anything a shape with flexible properties.
```

Use `**bold words**`, `*italic words*`, and `[link text](destination)` as usual. Keep the main `#` headline first. Each `##` heading creates a feature column beneath the hero. Use `###` for smaller headings within a column.

Keep each section focused on one idea and use concrete examples. The feature row presents JSON objects, scalability, and fast, efficient storage, in that order.

## Change links or the menu

```markdown
[Documentation](DATABASE.md)
[JSON objects](/?id=abstract-objects)
```

The words inside `[]` are the label. The destination goes inside `()`. `/?id=abstract-objects` jumps to the heading with `:id=abstract-objects`.

In `_sidebar.md`, change labels or move lines to change the menu order. To reorder page content, move a heading and the content below it together in `home.md`.

## Add a feature column

Add a `##` heading with a unique ID made of lowercase letters and hyphens:

```markdown
## Your new section :id=new-section

A short description.
```

Then add its menu entry to `_sidebar.md`:

```markdown
- [Your new section](/?id=new-section)
```

The new column joins the feature grid automatically. There are three columns per row on wide screens; narrower screens stack them vertically.

## Change labels

In `labels.md`, edit the right-hand column. Keep the headings and left-hand column unchanged: they identify where each label appears. The header links use ordinary Markdown links.

The Object diagram table controls the JSON fields and reference in the objects illustration. Keep these lines short so they fit and preserve the JSON punctuation. The Storage diagram table controls its four short labels. The scalability illustration contains no text. Their shapes, colors, and layout are managed separately by a developer.

## Change section images

Each feature has a standalone image in `home.md`. The three features form one row on wide screens, with each text block above its image. Narrower screens stack the columns vertically in Markdown order. The opening hero centers an illustration of JSON objects flowing around RAM modules above its text.

Change an image's file path to use a different image. The words inside `![]` describe it for people using screen readers. Update that description when replacing the image, and keep the image on its own line.

```markdown
![Describe the image](assets/site/your-image.png)
```

The file must exist in the repository, or use a full image URL. Images automatically fit the available width. Additional images in the same section stay within its text.

## Review and publish

Save your Markdown changes, review the website on desktop and mobile, and check the links. Your Markdown editor shows the content; the website preview shows its final appearance.

The redesign is on `codex/objy-brand-website`. That branch does not automatically publish to the live site. Use the repository's review and publishing process; a developer can handle previews and releases.
