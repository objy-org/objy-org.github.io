# OBJY website artwork

## Hero

Generated in built-in image-generation mode. Site asset: `assets/site/everything-is-an-object.png`.

Six everyday objects express “everything is an object.” The PNG's alpha channel is preserved. Its file path and alternative text are managed in `content/home.md`.

### Generation prompt

Use case: illustration-story
Asset type: hero artwork for OBJY, an object-driven database website. Artwork only.
Primary request: "Everything is an object" expressed as a collection of six very different, clearly recognizable everyday things: a bicycle, a leafy potted plant, a human profile/bust, a closed book with a bookmark, a key on a ring, and a simple alarm clock. Each is an individual object of equal visual importance. Arrange them in a loose, balanced 3 by 2 collection with generous breathing room; not a scene, not a house, not a world or diorama. The objects must be easy to identify at small sizes.
Style: sophisticated flat 2D editorial illustration, crisp silhouettes, confident simple shapes, restrained screen-print texture, a contemporary design magazine rather than a children's illustration. No 3D, clay, miniatures, glossy plastic, fuzzy surfaces or photorealism.
Composition: landscape canvas, individual objects separated by empty space, no overlap, no central object, no boxes, frames, connecting lines, arrows or technical diagrams. All shapes wholly inside the canvas. Genuine transparent alpha background for a charcoal #212121 website.
Palette: warm off-white, muted coral #d49599, sage green, a little subdued ochre and lavender. Details must contrast clearly on a charcoal website.
No text, labels, logos, letters, numbers, code, database cylinders, wireframe cubes, glowing halos, background rectangle or watermark. This should say that any kind of thing can be an object, without depicting computer architecture.

## Section illustrations

Three native SVG illustrations use a consistent dark, coral, sage, and lavender palette:

- `assets/site/abstract-objects.svg`: identity, flexible properties, a reference, and optional hooks.
- `assets/site/storage-internals.svg`: hot fields, columns, and compressed fields in RAM, plus optional local WAL and S3 persistence.
- `assets/site/run-and-deploy.svg`: one node and a cluster with two shards and two replicas per shard.

These diagrams were authored as vector assets so their labels remain editable through the Markdown tables in `content/labels.md`. Their default labels also make each SVG understandable when viewed on its own. Paths and alternative descriptions live in `content/home.md`.
