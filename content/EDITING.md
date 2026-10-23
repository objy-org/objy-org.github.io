# Editing the OBJY website

The website runs on Docsify. Routine content changes only require Markdown, with no build command.

| What to change | File |
| --- | --- |
| Headline, product introduction, features, links | [home.md](home.md) |
| Left menu labels, links, and order | [_sidebar.md](../_sidebar.md) |
| Header links, navigation labels, page title and description | [labels.md](labels.md) |
| Existing technical documentation | [DOCUMENTATION.md](../DOCUMENTATION.md) |

## Change the page copy

Edit the words in `home.md`. Keep the heading's `:id=...` suffix so menu links keep working:

```markdown
## Objects :id=objects

Give anything a shape with flexible properties.
```

Use `**bold words**`, `*italic words*`, and `[link text](destination)` as usual. Keep the main `#` headline first. Use `##` for page sections and `###` for smaller headings within a section.

Keep each section focused on one idea and use concrete examples. The homepage presents objy.db and its object-centric database features.

## Change links or the menu

```markdown
[Documentation](docs/)
[Objects](/?id=objects)
```

The words inside `[]` are the label. The destination goes inside `()`. `/?id=objects` jumps to the heading with `:id=objects`.

In `_sidebar.md`, change labels or move lines to change the menu order. To reorder page content, move a heading and the content below it together in `home.md`.

## Add a section

Add a heading with a unique ID made of lowercase letters and hyphens:

```markdown
## Your new section :id=new-section

A short description.
```

Then add its menu entry to `_sidebar.md`:

```markdown
- [Your new section](/?id=new-section)
```

The new section uses the same simple layout automatically.

## Change labels

In `labels.md`, edit the right-hand column. Keep the headings and left-hand column unchanged: they identify where each label appears. The header links use ordinary Markdown links.

The layout, font, colors, and illustration design are managed separately by a developer.

## Change the header image

The image at the end of the opening section in `home.md` becomes the header illustration. Change its file path to use a different image. The words inside `![]` describe the image for people using screen readers. Keep it as a standalone Markdown image.

## Add an image

```markdown
![Describe the image](assets/img/your-image.png)
```

The file must exist in the repository, or use a full image URL. Images automatically fit the page width.

## Review and publish

Save your Markdown changes, review the website on desktop and mobile, and check the links. Your Markdown editor shows the content; the website preview shows its final appearance.

The redesign is on `codex/objy-brand-website`. That branch does not automatically publish to the live site. Use the repository's review and publishing process; a developer can handle previews and releases.
