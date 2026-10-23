# Editing the OBJY website

The website runs on Docsify. Routine content changes only require Markdown, with no build command.

| What to change | File |
| --- | --- |
| Headline, product introduction, features, links | [home.md](home.md) |
| Left menu labels, links, and order | [_sidebar.md](../_sidebar.md) |
| Other navigation labels, illustration labels, page title and description | [labels.md](labels.md) |
| Existing technical documentation | [DOCUMENTATION.md](../DOCUMENTATION.md) |

## Change the page copy

Edit the words in `home.md`. Keep the heading's `:id=...` suffix so menu links keep working:

```markdown
## Objects :id=objects

Give anything a shape with flexible properties.
```

Use `**bold words**`, `*italic words*`, and `[link text](destination)` as usual. Keep the main `#` headline first. Use `##` for page sections and `###` for smaller headings within a section.

Keep the copy short: a heading and one or two sentences per feature. The homepage presents objy.db and its object-centric database features.

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

In `labels.md`, edit the right-hand column. Keep the headings and left-hand column unchanged: they identify where each label appears. Keep illustration labels short so they fit.

The layout, font, colors, and object illustration are managed separately by a developer.

## Add an image

```markdown
![Describe the image](assets/img/your-image.png)
```

The file must exist in the repository, or use a full image URL. Images automatically fit the page width.

## Review and publish

Save your Markdown changes, review the website on desktop and mobile, and check the links. Your Markdown editor shows the content; the website preview shows its final appearance.

The redesign is on `codex/objy-brand-website`. That branch does not automatically publish to the live site. Use the repository's review and publishing process; a developer can handle previews and releases.
