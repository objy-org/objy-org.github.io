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
## JSON with extras :id=abstract-objects

Give anything a shape with flexible properties.
```

Use `**bold words**`, `*italic words*`, and `[link text](destination)` as usual. Keep the main `#` headline first. The section with `:id=build-with-objects` is the full-width introduction beneath the hero. The next three `##` headings create the feature columns. Every later `##` heading creates a full-width section below that row. Use `###` for smaller headings within a section.

Keep each section focused on one idea and use concrete examples. The feature row presents JSON with extras, Simple API, and “Runs everywhere, horizontally scalable”, in that order. Storage internals follows as a separate section.

## Change links or the menu

```markdown
[Documentation](DATABASE.md)
[JSON with extras](/?id=abstract-objects)
```

The words inside `[]` are the label. The destination goes inside `()`. `/?id=abstract-objects` jumps to the heading with `:id=abstract-objects`.

The bottom Deployment section is edited in `home.md`. Its first bullet list becomes three explanations side by side, with each bold phrase used as a title. Below it are a GitHub link, the “Bring your own cloud” label, and a second list of provider links. Keep `:id=deployment` and `:id=bring-your-own-cloud` so the layout stays connected. The explanations stack and the links wrap on small screens. All copy and destinations are editable in Markdown.

In `_sidebar.md`, change labels or move lines to change the menu order. To reorder page content, move a heading and the content below it together in `home.md`.

## Add a section

Add a `##` heading with a unique ID made of lowercase letters and hyphens:

```markdown
## Your new section :id=new-section

A short description.
```

Then add its menu entry to `_sidebar.md`:

```markdown
- [Your new section](/?id=new-section)
```

Keep the `build-with-objects` introduction after the hero, followed by the three feature sections together. Append new `##` sections after those to add full-width content below it. On narrower screens, the columns and each section’s text and image stack vertically.

## Change labels

In `labels.md`, edit the right-hand column. Keep the headings and left-hand column unchanged: they identify where each label appears. The header links use ordinary Markdown links.

The Object diagram table controls the JSON fields and reference in the objects illustration. Keep these lines short so they fit and preserve the JSON punctuation. The Storage diagram table controls the labels and JSON example in the larger 3D storage illustration. The API diagram table controls the short operation labels in the Simple API illustration. The scalability illustration has no editable labels. Their shapes, colors, and layout are managed separately by a developer.

## Change section images

Each feature has a standalone image in `home.md`. The three features form one row on wide screens, with each text block above its image. The introduction above and storage section below use text beside larger images. Narrower screens stack the columns and section content vertically in Markdown order. The opening hero centers an illustration of empty JSON objects and arrays floating among arrows above its text.

Change an image's file path to use a different image. The words inside `![]` describe it for people using screen readers. Update that description when replacing the image, and keep the image on its own line.

```markdown
![Describe the image](assets/site/your-image.png)
```

The file must exist in the repository, or use a full image URL. Images automatically fit the available width. Additional images in the same section stay within its text.

## Review and publish

Save your Markdown changes, review the website on desktop and mobile, and check the links. Your Markdown editor shows the content; the website preview shows its final appearance.

The redesign is on `codex/objy-brand-website`. That branch does not automatically publish to the live site. Use the repository's review and publishing process; a developer can handle previews and releases.
