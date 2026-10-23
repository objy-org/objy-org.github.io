<!-- Edit the words and images using Markdown. Keep each :id=... so menu links continue to work. -->

# Everything is **an object.** :id=top

> objy.db

A person, a product, a place, an idea. objy.db is an in-memory database for the objects that make up your application. Give them shape, connect them, and build anything.

[Explore the database](/?id=abstract-objects)

![A bicycle, a plant, a person, a book, a key, and a clock: different things, all objects.](assets/site/everything-is-an-object.png)

## Abstract objects :id=abstract-objects

An object is a way to describe anything. It has an identity and properties; what those properties mean is up to you. The same simple model can represent a bicycle, its owner, or a whole rental service.

### Shape without a fixed schema

Store text, numbers, lists, and nested information. Objects in the same collection can have different shapes and evolve with your application.

### Connected, reusable, extensible

References connect objects to other objects. Hooks can validate, transform, or respond to object operations. Optional behavior extensions add inheritance and lifecycle actions when you need them.

### One model, many possibilities

Group objects into collections, query their properties, and control access with permissions. Start with a single thing and build up to a whole system.

![An object has a unique identity, flexible properties, a reference to another object, and optional hooks.](assets/site/abstract-objects.svg)

## Storage internals :id=storage-internals

Objects stay simple on the outside. Inside, objy.db combines in-memory access, compression, and column storage to make better use of memory and avoid unnecessary work.

### In-memory speed

Active objects and indexes live in RAM, so local hot reads do not need a disk lookup. Bulk operations process groups of objects together.

### Compression where it helps

Compress less-used fields in memory while keeping indexed fields and columns ready to query. Reads reconstruct the complete object when needed.

### Columns for focused queries

Selected fields use compact column storage. Sums, averages, and grouped queries can work with those values instead of loading every full object.

### Persistence beyond memory

Journals and snapshots go to S3-compatible storage. An optional local write-ahead log lets writes be acknowledged after a disk flush, rather than memory acceptance alone.

![Hot fields, compact columns, and compressed fields share an in-memory working set; a local write-ahead log and S3 journals and snapshots provide persistence.](assets/site/storage-internals.svg)

## Run & deploy :id=run-and-deploy

From a local process to a sharded, replicated cluster. Run objy.db on infrastructure you choose, and size the deployment around your workload.

### Your infrastructure

Run with Node.js or Docker: on your laptop, on virtual machines, in your own data center, or in the cloud. S3-compatible persistence keeps storage portable across providers.

### Built to cluster

Shards distribute objects across nodes. Replicas keep additional copies of each shard. Any public node can accept a request and route it to the node that owns the object.

### Grow deliberately

Start with one node, then plan more shards, replicas, or memory as your needs grow. Replicas synchronize asynchronously; topology changes use a planned resize and restore process.

[Read the database documentation](DATABASE.md)

![A single node grows into a cluster with two shards, each with two replicas, running locally, in containers, on virtual machines, or in the cloud.](assets/site/run-and-deploy.svg)
