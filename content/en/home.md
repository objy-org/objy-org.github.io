<!-- Edit the words and images using Markdown. Keep each :id=... so menu links continue to work. -->

# Fast, large-scale<br> in-memory object database. :id=top

> Build applications around fast objects.

Flexible JSON objects. Live references. Efficient storage.\
Build your application on OBJY, with API, authentication, users, and permissions built in.

- [Get started](/get-started.md)
- [See an application example](/?id=object-capabilities)

![Apps, AI agents, and APIs share floating JSON objects and arrays through sweeping arrows.](assets/site/applications-objects.svg)

## More than JSON. :id=abstract-objects

Dynamic properties, nested data, unique identities, and live references. Model objects your way, and evolve them as your application grows.

![A JSON object with an identity, color, availability, and an owner reference to a person in the people collection.](assets/site/abstract-objects.svg)

## One API. Every operation. :id=simple-api

Create, read, update, and delete. Query, aggregate, and search by vector through one API.

![Query, Vector, CRUD, and Aggregate share one API connection.](assets/site/simple-api.svg)

## Run anywhere. Scale out. :id=run-and-deploy

Start in a browser or on a server. Distribute objects across a cluster as your data and workload grow.

![A browser window, a single server, and three connected servers show deployment from the browser to a horizontally scaled cluster.](assets/site/run-and-deploy.svg)

## Users & access. Built in. :id=users-and-access

Users, authentication, permissions, and role-based access control. Define who can read, write, and administer.

![User identities connect to a login lock and an access-control shield.](assets/site/users-access.svg)

## Build a bike-rental app. :id=object-capabilities

Bikes are objects. Owners are objects. Connect them, then find what’s available.

#### Bike :id=example-bike

> app / bikes / bike-001

```json
{
  "_id": "bike-001",
  "name": "City bike",
  "available": true,
  "price": 199,
  "description": "Everyday city rides.",
  "owner": {
    "type": "reference",
    "collection": "people",
    "value": "person-001"
  }
}
```

### Object :id=example-object

**Your data. Your shape.**

Store a bike with its own properties. Reference its owner without copying their profile.

[Follow the owner reference →](/?id=example-owner)

#### Person :id=example-owner

**Connected, without the copies.**

This is the person referenced by the bike. Read their current profile through the reference.

> app / people / person-001

```json
{
  "_id": "person-001",
  "name": "Alex",
  "email": "alex@example.com"
}
```

[← Back to the bike](/?id=example-object)

### Query :id=example-query

**Find what’s available.**

Find available bikes, sorted by price.

```js
await bikes.find(
  { available: true },
  { sortBy: 'price', sort: 'asc', limit: 10 }
);
```

### Meta :id=example-meta

**One collection. Smarter storage.**

Choose which fields are indexed, stored in columns, or compressed for the whole collection.

> app / bikes / meta

```json
{
  "indexes": ["available", "price"],
  "columns": ["price"],
  "tiering": {
    "mode": "compressedMemory",
    "offload": ["description"],
    "minBytes": 4096
  }
}
```

## Objects outside. Smart storage inside. :id=storage-internals

Work with complete objects. Internally, OBJY splits them into blocks for fast access and efficient storage.

- **Hot fields:** Frequently used data stays uncompressed in memory.
- **Compact columns:** Selected values sit together for efficient scans and aggregation.
- **Compressed fields:** Keep more data in memory. Expand it when you read.

> **Fast in memory. Optional S3 durability.**
>
> Enable S3-backed journals and snapshots to preserve your objects for recovery.

![A complete JSON object sits in front of three in-memory storage tiers. Persist and recover arrows connect them to optional S3 durability through journals and snapshots.](assets/site/storage-internals.svg?v=2)

## Start with one node. :id=start-building

Get OBJY running, create your first object, and build from there.

- [Read the Quick Start →](/content/server.md?id=quick-start)
- [Explore cluster setup](/content/server.md?id=run-a-cluster)

---

[OBJY · Build around objects.](/?id=top) · [View on GitHub ↗](https://github.com/objy-org/objy.db)
