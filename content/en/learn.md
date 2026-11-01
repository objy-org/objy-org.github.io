# Learn OBJY. :id=learn

Start with a bike. Connect its owner. Build from there.

## ![](assets/site/icons/database.svg) Database :id=database

**Inside your application.** `@objy/db` runs in your browser or Node.js process. You work with collections of JSON objects, directly in memory.

### Collections :id=collections

Create a database called `app`, then give related objects a home: bikes in `bikes`, owners in `people`. Each collection has its own settings for indexes and storage.

![The app database branches into bikes and people collections. Each contains independent JSON objects.](assets/site/learn/collections.svg)

<details>
<summary>Create the database and collections</summary>

```js
import { createDatabase } from "@objy/db";
const objy = createDatabase();
await objy.createDatabase("app");
const app = objy.database("app");
await app.createCollection("bikes");
await app.createCollection("people");
const bikes = app.collection("bikes");
```

</details>

[Database setup](/content/database.md?id=use-the-same-database-api)

### Objects :id=objects

A bike is an object with an `_id` and your own properties. The ID is unique within its collection; OBJY generates one when you leave it out.

Numbers, booleans, arrays, and nested objects keep their types. Objects in the same collection can have different properties.

![One plain JSON bike object: its ID identifies it, and its properties describe it.](assets/site/learn/objects.svg)

[Object model](/content/api.md?id=objects)

### Properties :id=properties

Insert the bike, then change just its location. `$set` accepts dot paths for nested fields; `$unset` removes a property.

```js
await bikes.insert({
  _id: "bike-01", name: "City bike",
  available: true, price: 15
});
await bikes.patch("bike-01", {
  $set: { "location.city": "Berlin" }
});
```

Use `replace` for a whole new object, `remove` to delete it, and bulk methods for many objects.

[Write operations](/content/database.md?id=bulk-is-the-native-path)

### References :id=references

The bike's `owner` points to Alex in `people`. Store the destination's collection and ID. On read, OBJY resolves it into `owner.object` with Alex's current data.

![The bike contains an owner reference. Its object sub-property resolves Alex from the separate people collection; the faint Alex object shows the source.](assets/site/learn/references.svg)

<details>
<summary>Connect the bike to Alex</summary>

```js
await app.collection("people").insert({
  _id: "person-42", name: "Alex"
});
await bikes.patch("bike-01", {
  $set: { owner: {
    type: "reference",
    collection: "people",
    value: "person-42"
  } }
});
```

</details>

`owner.object` is the resolved view. The reference keeps pointing to Alex when his data changes.

[References and read depth](/content/api.md?id=live-references)

### Queries :id=operations

Find the available bikes, or calculate their average price. The first operation returns objects; the second computes a result across them.

```js
await bikes.find({ available: true });

await bikes.search({
  available: true,
  $aggregate: {
    fields: { averagePrice: { $avg: "price" } }
  }
});
```

[Filters and sorting](/content/api.md?id=query) · [Aggregation](/content/api.md?id=aggregation)

### Vectors and HNSW :id=vectors

Find bikes with similar features. Your app creates an embedding and stores those numbers in `_vec`.

The **HNSW index** searches a graph in memory: large jumps narrow the area, then nearby connections lead to similar objects.

![A highlighted search takes broad jumps through sparse HNSW layers, then explores nearby bike vectors.](assets/site/learn/vectors.svg)

<details>
<summary>Store a vector and find similar bikes</summary>

```js
await bikes.patch("bike-01", {
  $set: { _vec: [0.2, 0.8, 0.4] }
});
await bikes.ready();
const similar = await bikes.search({
  $vector: { vector: [0.21, 0.79, 0.4], limit: 3 }
});
```

</details>

Use the same embedding model for objects and queries. The short vectors above are illustrative; `ready()` waits for the index.

[Vector search](/content/api.md?id=vector-search)

### Storage :id=memory

You read complete objects. Internally, collection metadata lets you choose how their fields use memory:

- **Hot fields:** keep frequently read values directly accessible.
- **Columns:** store values such as `price` compactly for aggregation.
- **Compression:** reduce the space used by colder object data.

![A plain bike object feeds a physical RAM module with hot fields, compact columns, and compressed data.](assets/site/learn/memory.svg)

<details>
<summary>Choose indexes and storage settings</summary>

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

</details>

Writes become visible immediately. Indexes and columns can finish building in the background. Embedded data lives for the lifetime of the page or process.

[Storage and indexes](/content/database.md?id=shape-the-workload-with-metadata)

## ![](assets/site/icons/server.svg) Server :id=server

**Shared by your applications.** `@objy/server` wraps the same database engine with network access, users, permissions, clustering, and persistence.

### API :id=server-api

Your app sends a request through REST or the JavaScript client. The server checks the token and permissions, then runs the operation on the database.

![An application sends a request through API and access checks to the same in-memory database engine.](assets/site/learn/server.svg)

<details>
<summary>Read the bike through REST</summary>

```http
GET /api/app/bikes/object/bike-01
Authorization: Bearer <accessToken>
```

</details>

[REST API](/content/api.md) · [JavaScript client](/content/client.md)

### Users and permissions :id=users-permissions

Signing in gives a user an access token. Collection grants and object rules determine which data they can use.

This rule lets Alex read (`r`) and update (`u`) bikes whose `owner.value` is his ID. A reference alone grants no access.

```json
{
  "permissions": [{
    "query": { "owner.value": "person-42" },
    "perm": "ru"
  }]
}
```

[Authentication and permissions](/content/api.md?id=authentication-and-permissions)

### Clusters :id=clusters

Grow beyond one machine with two different building blocks:

- **Shards** divide the objects across nodes.
- **Replicas** keep additional copies of a shard on other nodes.

Requests can reach any public node; routing finds the owner. Replicas catch up asynchronously.

![Two object shards live on different machines, with one additional replica of each on another machine.](assets/site/learn/cluster.svg)

[Cluster setup](/content/server.md?id=form-a-cluster)

### Persistence :id=persistence

Choose what survives a restart:

- **Local WAL** records writes on the node. With `localWal` acknowledgement, success follows the local flush.
- **Optional S3** keeps journals and snapshots asynchronously.
- **Recovery** restores objects and rebuilds indexes in memory.

A local WAL acknowledgement does not wait for replicas or S3 uploads.

[Persistence settings](/content/server.md?id=make-it-durable) · [Run OBJY](get-started.md)
