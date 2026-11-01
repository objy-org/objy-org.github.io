# Learn OBJY. :id=learn

A bike, its owner, and the database behind them.

## Database :id=database

Work with JSON objects directly in memory, in browsers and Node.js.

### Collections :id=collections

Collections group objects: `bikes` for bikes, `people` for owners. Their metadata controls indexes and storage.

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

Objects represent things in your app. Each has a unique `_id` within its collection; OBJY creates one if needed. Properties can differ between objects, without a fixed schema.

![A bike object with its ID, name, availability, price, and tags.](assets/site/learn/objects.svg)

[Object model](/content/api.md?id=objects)

### Properties :id=properties

Store text, numbers, booleans, arrays, nested objects, or `null`. Use `insert` to add an object and `patch` to change fields.

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

Dot paths update nested fields. `replace` replaces an object; `remove` deletes it. Bulk methods handle many objects.

[Writing and changing objects](/content/database.md?id=bulk-is-the-native-path)

### References :id=references

The bike’s `owner` points to Alex in `people`. Resolving the reference adds Alex’s current data under `owner.object`:

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

Store `type`, `collection`, and `value`; `object` is the expanded read view. Later reads can reflect Alex’s updates. Reference depth limits how far OBJY follows relationships.

![The bike references its owner Alex. On read, owner.object contains Alex's data.](assets/site/learn/references.svg)

[Reference storage and reads](/content/api.md?id=live-references)

### Queries :id=operations

Find available bikes or aggregate their prices. Queries also support sorting and pagination:

```js
await bikes.find({ available: true });
await bikes.search({
  $aggregate: {
    fields: { averagePrice: { $avg: "price" } }
  }
});
```

![CRUD, queries, aggregation, and vector search work with the same bike object.](assets/site/learn/apis.svg)

[Queries](/content/api.md?id=query) · [Aggregation](/content/api.md?id=aggregation) · [Vectors](/content/api.md?id=vector-search)

### Vectors and HNSW :id=vectors

A vector represents features as numbers. Store an embedding in `_vec` to find similar objects. Your app generates embeddings from text, images, or other data.

**HNSW** searches a layered graph in memory: broad jumps first, nearby matches next. It finds approximate nearest neighbors quickly.

```js
await bikes.patch("bike-01", {
  $set: { _vec: [0.2, 0.8, 0.4] }
});
await bikes.ready();
const similar = await bikes.search({
  $vector: {
    vector: [0.21, 0.79, 0.4],
    limit: 3
  }
});
```

The short vectors are illustrative. Use the same embedding model for data and searches. `ready()` waits for the index; results include a similarity `_score`.

![A query follows a highlighted route through three HNSW graph layers. Sparse upper connections guide the search into a denser neighborhood of bike vectors, ending at similar bikes.](assets/site/learn/vectors.svg)

[Vector search API](/content/api.md?id=vector-search) · [HNSW background](https://arxiv.org/abs/1603.09320)

### Storage :id=memory

Objects stay in RAM. OBJY splits their fields internally and rebuilds complete objects on read.

- **Hot fields:** direct access to frequently used data.
- **Columns:** compact values for fast aggregation.
- **Compressed fields:** smaller storage for colder data.

Collection metadata chooses what to index, store in columns, and keep hot:

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

Embedded data lasts until the page or process closes. The server adds optional persistence for recovery after restarts.

![The bike's data is organized into hot fields, columns, and compressed fields inside RAM.](assets/site/learn/memory.svg)

[Storage settings](/content/database.md?id=shape-the-workload-with-metadata) · [Memory and lifecycle](/content/database.md?id=memory-is-the-database)

## Server :id=server

Share the database over a network, with authentication, permissions, clustering, and optional persistence.

### API :id=server-api

Use REST or the JavaScript client. The server checks access before running your object operations.

```http
GET /api/app/bikes/object/bike-01
Authorization: Bearer <accessToken>
```

![An application sends an HTTP request to the server. API and authentication checks sit in front of the in-memory database.](assets/site/learn/server.svg)

[REST API](/content/api.md) · [JavaScript client](/content/client.md)

### Users and permissions :id=users-permissions

Users sign in for access tokens. Collection grants and object rules control access; an owner reference alone grants nothing.

This user rule allows reading (`r`) and updating (`u`) Alex’s bikes:

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

A cluster distributes data across nodes and routes requests to the node holding each object.

- **Sharding:** splits data across machines; queries combine results from the relevant shards.
- **Replication:** keeps extra copies, updated asynchronously.

![Two shards are held on different nodes, with an additional replica of each shard on another node.](assets/site/learn/cluster.svg)

[Cluster setup](/content/server.md?id=form-a-cluster) · [Routing and replication](/content/server.md?id=route-and-replicate)

### Persistence :id=persistence

Enable persistence to recover data after a restart:

- **Local WAL:** logs writes on the node; acknowledgement depends on configuration.
- **Optional S3:** stores journals and snapshots. Uploads happen asynchronously.
- **Recovery:** restores objects and rebuilds indexes in RAM.

Local WAL acknowledgement does not wait for replication or S3 uploads.

[Persistence and recovery](/content/server.md?id=make-it-durable) · [Get started](get-started.md)
