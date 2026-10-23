<!-- Edit the words and images using Markdown. Keep each :id=... so menu links continue to work. -->

# Everything is **an object.** :id=top

> objy.db

A person, a product, a place, an idea. Model your world with objy.db, an in-memory database built around objects.

[Explore objy.db](/?id=abstract-objects)

![The original OBJY illustration: an object shown as a cube alongside code describing its properties and behavior.](assets/site/header-objects.png)

## Your world. In objects. :id=abstract-objects

> Abstract objects

A customer. A bike. A whole business. Give each object an identity, properties, and connections. No fixed schema to work around.

Query them together. Add hooks when you need behavior. Build from there.

![An object has a unique identity, flexible properties, a reference to another object, and optional hooks.](assets/site/abstract-objects.svg)

## Speed without the bulk. :id=storage-internals

> Storage internals

Keep active data in memory. Compress the fields you use less. Query compact columns without reading every object.

Back it with S3-compatible journals and snapshots, plus an optional local write-ahead log.

![Hot fields, compact columns, and compressed fields share an in-memory working set; a local write-ahead log and S3 journals and snapshots provide persistence.](assets/site/storage-internals.svg)

## Start small. Go anywhere. :id=run-and-deploy

> Run & deploy

From a local process to a cluster on your own infrastructure. Run with Node.js or Docker: on your laptop, on your servers, or in the cloud.

Shards distribute objects. Replicas keep extra copies. Plan the capacity you need.

[Read the docs](DATABASE.md)

![A single node grows into a cluster with two shards, each with two replicas, running locally, in containers, on virtual machines, or in the cloud.](assets/site/run-and-deploy.svg)
