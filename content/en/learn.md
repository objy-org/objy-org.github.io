# Learn OBJY. :id=learn

A bike, its owner, and the database behind them.

## Database :id=database

The database engine stores and works with your objects in memory. It runs directly in browsers and Node.js. We will use a bike and its owner to explain the data model, then look inside the storage.

### Collections :id=collections

A database contains named collections. In our `app` database, `bikes` holds bike objects and `people` holds their owners. A collection groups objects and keeps settings such as indexes and compression in its metadata.

```js
import { createDatabase } from "@objy/db";
const objy = createDatabase();
await objy.createDatabase("app");
const app = objy.database("app");
await app.createCollection("bikes");
await app.createCollection("people");
const bikes = app.collection("bikes");
```

![The bikes collection contains a bike and other objects, with shared settings for indexes, columns, and compression.](assets/site/learn/collections.svg)

[Database setup](/content/database.md?id=use-the-same-database-api)

### Objects :id=objects

An object describes something in your application: a bike, a person, or a booking. Its `_id` identifies it within its collection; OBJY generates one when you omit it. This bike combines text, a boolean, a number, and an array in one JSON object.

Objects in the same collection can have different properties. Another bike can include a battery or a nested location without changing every existing bike.

![A bike object with its ID, name, availability, price, and tags.](assets/site/learn/objects.svg)

[Object model](/content/api.md?id=objects)

### Properties :id=properties

Properties hold your data. They can contain strings, numbers, booleans, arrays, nested objects, or `null`. Add the bike with `insert`, then change selected properties with `patch`. A dot path such as `location.city` addresses a nested property.

```js
await bikes.insert({
  _id: "bike-01",
  name: "City bike",
  available: true,
  price: 15,
  tags: ["city", "electric"]
});
await bikes.patch("bike-01", {
  $set: { "location.city": "Berlin" }
});
```

Use `replace` for a complete object replacement and `remove` to delete an object. The corresponding bulk methods work with many objects at once.

[Writing and changing objects](/content/database.md?id=bulk-is-the-native-path)

### References :id=references

The bike belongs to Alex, whose object lives in `people` with ID `person-42`. Set the bike's `owner` property to a reference containing `type`, `collection`, and `value`. OBJY stores that relationship and can resolve the owner's current data when you read the bike:

```json
{
  "_id": "bike-01",
  "owner": {
    "type": "reference",
    "collection": "people",
    "value": "person-42",
    "object": { "_id": "person-42", "name": "Alex" }
  }
}
```

The nested `object` is the expanded read view. When Alex changes, later bike reads can reflect the new data. Reference depth controls how far OBJY follows relationships.

![The bike references its owner Alex. On read, owner.object contains Alex's data.](assets/site/learn/references.svg)

[Reference storage and reads](/content/api.md?id=live-references)

### Queries :id=operations

A query finds objects by their properties. Filter available bikes, sort or page the results, or aggregate their prices into a total or average:

```js
await bikes.find({ available: true });
await bikes.search({
  $aggregate: {
    fields: { averagePrice: { $avg: "price" } }
  }
});
```

For similarity search, your application supplies embeddings in `_vec`. OBJY builds a vector index and searches those embeddings alongside your object data.

![CRUD, queries, aggregation, and vector search work with the same bike object.](assets/site/learn/apis.svg)

[Queries](/content/api.md?id=query) · [Aggregation](/content/api.md?id=aggregation) · [Vectors](/content/api.md?id=vector-search)

### Storage :id=memory

Objects and their lookup structures live in RAM. Internally, OBJY can organize an object's properties into different storage blocks, then reconstruct the complete object when you read it.

- **Hot fields** keep frequently used properties directly accessible.
- **Columns** pack selected values together for compact storage and efficient aggregation.
- **Compressed fields** hold colder object data in compressed form in memory and unpack it when needed.

Indexes help locate matching objects; shared dictionaries reduce repeated values. Collection metadata controls these structures. For our bikes, this configuration indexes availability, puts prices in a column, and keeps selected fields hot while compressing larger object bodies:

```json
{
  "indexes": ["available"],
  "columns": ["price"],
  "tiering": {
    "mode": "compressedMemory",
    "keep": ["name", "available"]
  }
}
```

Embedded data lives for the lifetime of its browser page or Node.js process. The server adds shared access and optional persistence, explained next.

![The bike's data is organized into hot fields, columns, and compressed fields inside RAM.](assets/site/learn/memory.svg)

[Storage settings](/content/database.md?id=shape-the-workload-with-metadata) · [Memory and lifecycle](/content/database.md?id=memory-is-the-database)

## Server :id=server

The server wraps the same database engine in a service that applications can share. It adds network access, authentication, permissions, clusters, and recovery around the object model you just learned.

### API :id=server-api

Applications connect through REST or the JavaScript client. After authentication and permission checks, a request reaches the database holding the bike. The same objects, queries, and aggregations work through this interface.

```http
GET /api/app/bikes/object/bike-01
Authorization: Bearer <accessToken>
```

![An application sends an HTTP request to the server. API and authentication checks sit in front of the in-memory database.](assets/site/learn/server.svg)

[REST API](/content/api.md) · [JavaScript client](/content/client.md)

### Users and permissions :id=users-permissions

Users sign in to receive access tokens. Collection grants and object-level rules determine which operations they may perform. An owner reference describes a relationship; permissions separately control access to the bike.

For example, a user rule can allow reading and updating bikes whose `owner.value` points to Alex. Here, `r` means read and `u` means update:

```json
{
  "permissions": [
    {
      "query": { "owner.value": "person-42" },
      "perm": "ru"
    }
  ]
}
```

[Authentication and permissions](/content/api.md?id=authentication-and-permissions)

### Clusters :id=clusters

A cluster spreads objects across nodes. The database name, collection, and object ID determine an object's shard; the shard map tells the server which nodes hold it. Any public node can accept a request and route it to an owner.

- **Sharding** divides data across machines. Queries and aggregations gather results from the required shards.
- **Replication** keeps additional copies of shards. Replicas pull changes asynchronously and catch up after interruptions.

![Two shards are held on different nodes, with an additional replica of each shard on another node.](assets/site/learn/cluster.svg)

[Cluster setup](/content/server.md?id=form-a-cluster) · [Routing and replication](/content/server.md?id=route-and-replicate)

### Persistence :id=persistence

Memory serves the working data. Enable server persistence when objects need to survive a restart:

- **Local write-ahead log:** records operations on the node. With local-WAL acknowledgement and flushing enabled, a successful write includes that local log step.
- **Optional S3 storage:** journals record changes and snapshots capture object state for recovery. Uploads run asynchronously.
- **Recovery:** the server restores objects and replays newer operations. It rebuilds derived indexes, columns, and vector indexes in memory.

Replication and S3 uploads happen separately from a local-WAL acknowledgement. Choose the persistence configuration to match the recovery behavior your application needs.

[Persistence and recovery](/content/server.md?id=make-it-durable) · [Get started](get-started.md)
