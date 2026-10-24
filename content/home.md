<!-- Edit the words and images using Markdown. Keep each :id=... so menu links continue to work. -->

# Fast, efficient in-memory objects :id=top

> In-Memory Object Database

Build anything using powerful objects served by an in-memory database.

[Explore objy.db](/?id=build-with-objects)

![Floating empty JSON objects and arrays connected by flowing arrows.](assets/site/header-objects.svg)

## Build applications around objects. :id=build-with-objects

Model the people, products, and processes your app works with as objects. Connect them with references, then build interfaces that read, update, and share the same data.

![Two application windows exchange data with three empty JSON objects through two-way arrows.](assets/site/applications-objects.svg)

## JSON with extras :id=abstract-objects

Model anything with flexible JSON objects, unique identities, and live references.

![A JSON object with an identity, color, availability, and an owner reference to a person in the people collection.](assets/site/abstract-objects.svg)


## Simple API :id=simple-api

Create, read, update, and delete objects through one simple API. Query, aggregate, and find similar objects with vector search.

![One object API connects to four operations: CRUD, querying, aggregation, and vector search.](assets/site/simple-api.svg)


## Runs everywhere, horizontally scalable :id=run-and-deploy

Run in browsers, on servers, or across clusters. Scale horizontally by adding nodes as your application grows.

![A browser window, a single server, and three connected servers show deployment from the browser to a horizontally scaled cluster.](assets/site/run-and-deploy.svg)

## Storage internals :id=storage-internals

Each object is split internally into smart blocks for fast access and efficient storage.

- **Hot fields:** Frequently used fields stay uncompressed in memory for fast access.
- **Compact columns:** Selected values sit together for efficient scans and analytics.
- **Compressed fields:** Less-used data stays compressed in memory and expands when read.

![A complete JSON object sits in front of three visible internal storage tiers: hot fields, compact columns, and compressed fields, all in memory.](assets/site/storage-internals.svg)

## Deploy on your terms. :id=deployment

Start with one node. Run on your own hardware or in your cloud, then scale out across a cluster.

- **On your machine** Run objy.db with Node.js or Docker on a laptop, a server, or a virtual machine.
- **In your cloud** Choose your provider and deploy on infrastructure you control, with your own networking and S3-compatible storage.
- **Across a cluster** Distribute objects across shards and keep replicas on multiple nodes to match your application's capacity needs.

[GitHub](https://github.com/objy-org)

### Bring your own cloud :id=bring-your-own-cloud

- [Hetzner](https://www.hetzner.com/cloud/)
- [IONOS](https://cloud.ionos.com/)
- [Google Cloud](https://cloud.google.com/)
- [AWS](https://aws.amazon.com/)
- [Azure](https://azure.microsoft.com/)
