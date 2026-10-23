<!-- Edit the words and images using Markdown. Keep each :id=... so menu links continue to work. -->

# Think in objects. **Build anything.** :id=top

> In-memory object database

Store, connect, and query the things your application is made of. An in-memory database with flexible objects, compact storage, and clustering built in.

[Explore objy.db](/?id=abstract-objects)

![The original OBJY illustration: an object shown as a cube alongside code describing its properties and behavior.](assets/site/header-objects.png)

## Everything is an object. :id=abstract-objects

> Abstract objects

People, products, places, processes. Give anything an identity, properties, and connections. Let your data model evolve with your ideas.

![An object has a unique identity, flexible properties, a reference to another object, and optional hooks.](assets/site/abstract-objects.svg)

## Run your app. Understand your data. :id=storage-internals

> Storage internals

Read and write individual objects. Run aggregates across collections. In-memory access, compression, and compact columns power both kinds of work.

![Hot fields, compact columns, and compressed fields share an in-memory working set; a local write-ahead log and S3 journals and snapshots provide persistence.](assets/site/storage-internals.svg)

## One node. A whole cluster. Your call. :id=run-and-deploy

> Run & deploy

Start locally. Deploy on your infrastructure. Distribute objects across shards and add replicas as your needs grow.

[Read the docs](DATABASE.md)

![A single node grows into a cluster with two shards, each with two replicas, running locally, in containers, on virtual machines, or in the cloud.](assets/site/run-and-deploy.svg)
