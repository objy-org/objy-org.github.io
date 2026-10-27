<!-- Edit the words and images using Markdown. Keep each :id=... so menu links continue to work. -->

# In-Memory Object Database :id=top

> Build applications around fast objects.

Flexible JSON objects. Live references. Efficient storage.\
Build your application on OBJY, with API, authentication, users, and permissions built in.

- [Get started](/get-started.md)
- [See an object in action](/?id=object-capabilities)

![Apps, AI agents, and APIs share floating JSON objects and arrays through sweeping arrows.](assets/site/applications-objects.svg)

## One API. Every operation. :id=simple-api

Create, read, update, and delete. Query, aggregate, and search by vector through one API.

![Query, Vector, CRUD, and Aggregate share one API connection.](assets/site/simple-api.svg)

## JSON. With connections. :id=abstract-objects

Give every object its own shape and identity. Connect it to others with live references.

![A JSON object with an identity, color, availability, and an owner reference to a person in the people collection.](assets/site/abstract-objects.svg)

## Run anywhere. Scale out. :id=run-and-deploy

From browsers to servers and clusters. Add nodes as your application grows.

![A browser window, a single server, and three connected servers show deployment from the browser to a horizontally scaled cluster.](assets/site/run-and-deploy.svg)

## Users & access. Built in. :id=users-and-access

Users, authentication, permissions, and role-based access control (RBAC). Define who can read, write, and administer.

![User identities connect to a login lock and an access-control shield.](assets/site/users-access.svg)

## One object. A real application. :id=object-capabilities

A bike, its owner, and the storage behind it. Start with the data your application already understands.

#### Bike :id=example-bike

> app / bikes / bike-001

```json
{
  "_id": "bike-001",
  "name": "City bike",
  "available": true,
  "price": 199,
  "description": "A lightweight bike for everyday city rides.",
  "owner": {
    "type": "reference",
    "collection": "people",
    "value": "person-001"
  }
}
```

### Object :id=example-object

**Your data. Your shape.**

Every object has its own ID and flexible fields. Store a price, add a description, and follow the owner reference to a connected person without copying their profile into every bike.

[Follow the owner reference →](/?id=example-owner)

#### Person :id=example-owner

**Connected, without the copies.**

The reference identifies the person in the people collection. Resolve it when reading to use the connected object's current values.

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

**Find the bikes that fit.**

Filter available bikes, sort by price, and return up to ten matches. Query the same fields you see in the object through the JavaScript client.

```js
const bikes = client.database('app')
  .collection('bikes');

await bikes.find(
  { available: true },
  { sortBy: 'price', sort: 'asc', limit: 10 }
);
```

### Meta :id=example-meta

**Same objects. Smarter storage.**

Collection metadata controls how these objects are queried and stored.

- **Indexes:** `available` and `price` accelerate filtering and sorting.
- **Columns:** `price` sits in a compact column for efficient aggregation.
- **Compression:** Large `description` payloads stay compressed in memory. `minBytes` sets the size threshold; reads return complete objects.

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

![A complete JSON object sits in front of three internal storage tiers: hot fields, compact columns, and compressed fields.](assets/site/storage-internals.svg)

## Start with one node. :id=start-building

Get OBJY running, create your first object, and build from there.

- [Read the Quick Start →](/content/server.md?id=quick-start)
- [Explore cluster setup](/content/server.md?id=run-a-cluster)

---

[OBJY · Build around objects.](/?id=top) · [View on GitHub ↗](https://github.com/objy-org/objy.db)
