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


## Scalable and performant :id=run-and-deploy

Start with one node. Grow into a resilient cluster on your infrastructure.

![Three database silos connected in a cluster.](assets/site/run-and-deploy.svg)

## Storage internals :id=storage-internals

Each object is split internally into smart blocks for fast access and efficient storage.

- **Hot fields:** Frequently used fields stay uncompressed in memory for fast access.
- **Compact columns:** Selected values sit together for efficient scans and analytics.
- **Compressed fields:** Less-used data stays compressed in memory and expands when read.

![A complete JSON object sits in front of three visible internal storage tiers: hot fields, compact columns, and compressed fields, all in memory.](assets/site/storage-internals.svg)
