<!-- Edit the words and images using Markdown. Keep each :id=... so menu links continue to work. -->

# Fast, large-scale<br> in-memory object database. :id=top

> Build applications around fast objects.

- ![](assets/site/icons/features/flexible-objects.svg) Flexible JSON
- ![](assets/site/icons/features/query-aggregate.svg) OLAP + OLTP
- ![](assets/site/icons/features/cross-runtime.svg) Runs everywhere
- ![](assets/site/icons/features/authentication.svg) API & auth built in

![A layered OBJY database with a JSON object at its center, connected to apps, AI agents, APIs, and smaller object nodes.](assets/site/applications-objects.svg)

## What will you build? :id=object-capabilities

### ![](assets/site/icons/use-cases/agents.svg) AI agents & memory :id=use-case-agents

Store memories and embeddings together. Retrieve relevant context with vector search.

### ![](assets/site/icons/use-cases/analytics.svg) Analytics :id=use-case-analytics

Explore your data with fast filters and aggregations. Calculate metrics directly from your objects.

### ![](assets/site/icons/use-cases/apps.svg) Application backends :id=use-case-apps

Build tools and SaaS apps with APIs, authentication, users, and permissions already in place.

### ![](assets/site/icons/use-cases/anything.svg) Or anything else... :id=use-case-anything

Your objects. Your ideas. Build whatever comes next.

## Flexible JSON. Versatile APIs.<br> Fast, thanks to in-memory storage. :id=feature-highlights

Fast, flexible data is just the beginning. Explore what OBJY brings to your application, from the in-memory engine to a distributed backend.

![CRUD, queries, aggregation, and vector search above three overlapping JSON snippets: a person, an AI memory, and a connected device.](assets/site/architecture.svg)

### Objects outside. Smart storage inside. :id=storage-internals

Work with complete objects. Internally, OBJY splits them into blocks for fast access and efficient storage.

- **Hot fields:** Frequently used data stays uncompressed in memory.
- **Compact columns:** Selected values sit together for efficient scans and aggregation.
- **Compressed fields:** Keep more data in memory. Expand it when you read.

> **Fast in memory. Optional S3 durability.**
>
> Enable S3-backed journals and snapshots to preserve your objects for recovery.

![A complete JSON object sits in front of three in-memory storage tiers. Persist and recover arrows connect them to optional S3 durability through journals and snapshots.](assets/site/storage-internals.svg)


### Database core :id=database-core

The same engine, embedded in browsers and Node.js. [Explore the core docs](/content/database.md).

#### ![](assets/site/icons/features/flexible-objects.svg) Objects without rigid schemas :id=flexible-objects

Mix nested properties, arrays, and different value types. Your objects can evolve as your application does.

#### ![](assets/site/icons/features/live-references.svg) Live references, without copies :id=live-references

Connect objects and expand their references when reading. Store the relationship, without duplicating the referenced object.

#### ![](assets/site/icons/features/in-memory.svg) Objects at in-memory speed :id=in-memory

Work directly with objects held in memory, with no disk read in the core data path.

#### ![](assets/site/icons/features/hot-compressed.svg) Hot fields. Compressed bodies. :id=hot-compressed

Keep frequently used fields directly accessible in memory and compress the rest of each object.

#### ![](assets/site/icons/features/columns.svg) Columns inside. Objects outside. :id=compact-columns

Compact columns accelerate numeric aggregations. Read the same data back as complete objects.

#### ![](assets/site/icons/features/shared-values.svg) Repeated values, stored smarter :id=shared-values

Shared dictionaries reduce the memory used by values that appear again and again.

#### ![](assets/site/icons/features/metadata.svg) Tune storage through metadata :id=collection-metadata

Configure indexes, columns, and compression at collection level, while keeping your objects easy to work with.

#### ![](assets/site/icons/features/vector-search.svg) Find meaning with vector search :id=vector-search

Search application-provided embeddings with a built-in HNSW index, alongside your object data.

#### ![](assets/site/icons/features/query-aggregate.svg) Query it. Group it. Add it up. :id=query-aggregation

Filter and sort objects, then group, count, sum, or average your data with the same engine.

#### ![](assets/site/icons/features/bulk-operations.svg) Built for one object. Or many. :id=bulk-operations

Single and bulk writes use the same execution path, so batches are a natural part of working with objects.

#### ![](assets/site/icons/features/cross-runtime.svg) One engine across environments :id=cross-runtime

Use the same database API in the browser and in Node.js. Bring the engine to where your application runs.

### DB server :id=db-server

Add application services, distributed operation, and optional durability around the core. [Explore the server docs](/content/server.md).

#### ![](assets/site/icons/features/rest-client.svg) Connect through REST or JavaScript :id=rest-client

Work with the database from apps and services through the REST API or the JavaScript client.

#### ![](assets/site/icons/features/authentication.svg) Users and authentication, included :id=authentication

Manage user identities and authenticated sessions as part of your database backend.

#### ![](assets/site/icons/features/permissions.svg) Access control down to the object :id=object-permissions

Combine collection permissions, roles, and object-level rules to control who can access your data.

#### ![](assets/site/icons/features/files.svg) Files are objects too :id=file-objects

Keep file metadata in objects and blobs in S3, protected by the same object permissions.

#### ![](assets/site/icons/features/hooks.svg) Your logic around each operation :id=operation-hooks

Use server hooks to add behavior around creating, reading, updating, and deleting objects.

#### ![](assets/site/icons/features/sharding.svg) Spread objects across machines :id=object-sharding

Distribute objects across nodes with object sharding, so your database can span multiple machines.

#### ![](assets/site/icons/features/replication.svg) Replicas that catch up :id=replication-recovery

Asynchronous replication keeps copies on other nodes and lets replicas recover after interruptions.

#### ![](assets/site/icons/features/s3-durability.svg) Optional S3 durability :id=s3-durability

Enable a local write-ahead log, S3 journals, and snapshots to persist data and restore it after a restart.

#### ![](assets/site/icons/features/streaming-import.svg) Stream data in, batch by batch :id=streaming-import

Import NDJSON in bounded batches, without loading the entire source into memory at once.

#### ![](assets/site/icons/features/cluster-console.svg) See inside your cluster :id=cluster-console

Inspect memory, replication, readiness, and topology in the administration console.

---

[OBJY · Build around objects.](/?id=top) · [View on GitHub ↗](https://github.com/objy-org/objy)
