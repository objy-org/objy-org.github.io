# Learn OBJY. :id=learn

Start with a bike. Connect its owner. Build from there.

## ![](assets/site/icons/database.svg) Database :id=database

**Objects in memory, on the server.** Your application connects through REST or `@objy/client`. Databases and collections organize the JSON objects.

### Collections :id=collections

Create a database called `app`, then give related objects a home: bikes in `bikes`, owners in `people`. Each collection has its own settings for indexes and storage.

![The app database branches into bikes and people collections. Each contains independent JSON objects.](assets/site/learn/collections.svg)

<details>
<summary>Create the database and collections</summary>

Run `npm install @objy/client` and connect to a running server using the administrator password printed by the CLI. Use a new database name for this example. The following examples reuse `app` and `bikes`.

```js
import { createClient } from "@objy/client";

const client = createClient({ url: "http://localhost:8080" });
await client.login({ username: "admin", password: "<printed-password>" });

await client.createDatabase("app");
const app = client.database("app");
await app.createCollection("bikes");
await app.createCollection("people");
const bikes = app.collection("bikes");
```

</details>

[Database setup](/content/api.md?id=databases)

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

[Write operations](/content/api.md?id=bulk-objects)

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

### Create, Read, Update, Delete :id=crud

Use the same collection for all four operations. This example creates a second bike, reads it by ID, changes its price, then deletes it.

```js
// Create
await bikes.insert({
  _id: "bike-02",
  name: "Cargo bike",
  price: 25
});

// Read
await bikes.find({ _id: "bike-02" });

// Update
await bikes.patch("bike-02", {
  $set: { price: 30 }
});

// Delete
await bikes.remove("bike-02");
```

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
// The server returns 503 while its vector index is warming. Retry then.
const similar = await bikes.search({
  $vector: { vector: [0.21, 0.79, 0.4], limit: 3 }
});
```

</details>

Use the same embedding model for objects and queries. The short vectors are illustrative. Retry a search if the server returns `503` while its vector index warms.

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

The server keeps objects in memory. Indexes and columns can warm in the background; persistence settings control recovery after a restart.

[Storage and indexes](/content/api.md?id=collections)

## ![](assets/site/icons/server.svg) Server :id=server

**One shared database service.** `@objy/server` runs the database engine, HTTP API, users, permissions, clustering, and persistence together.

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

Users are objects too. Sign-in returns a token; the server checks its permissions on every operation.

- **Match objects** with a `query`, such as Alex's ID in `owner.value`.
- **Choose actions** with `perm`: `c` create, `r` read, `u` update, `d` delete.
- **Grant whole collections** with `read` and `write` grants.

For ordinary users, no matching rule or grant means no access. A reference alone grants no access.

![Alex's read-and-update rule matches his bike's owner reference. His bike allows reading and updating; another owner's bike does not.](assets/site/learn/permissions.svg)

<details>
<summary>Create Alex and sign in</summary>

With the `app` database already set up, an administrator creates Alex in `app/users`. The rule uses his profile ID, `person-42`, from the bike's owner reference. Passwords are hashed on write.

```http
POST /api/app/users/object
Authorization: Bearer <adminAccessToken>
Content-Type: application/json

{
  "_id": "alex",
  "username": "alex",
  "password": "<alex-password>",
  "permissions": [
    {
      "name": "My bikes",
      "query": { "owner.value": "person-42" },
      "perm": "ru"
    }
  ]
}
```

Alex then signs in. Use the returned `accessToken` as `<alexAccessToken>` in the next examples. This login scopes his access to `app`.

```http
POST /api/app/users/auth
Content-Type: application/json

{ "username": "alex", "password": "<alex-password>" }
```

</details>

<details>
<summary>See what Alex can read and change</summary>

Alex asks for available bikes. The server combines his filter with the read rule, so he only sees available bikes whose `owner.value` is `person-42`.

Expanding `owner.object` also needs read access to the person. These requests use `$refDepth: 0` to return the reference without expanding it.

```http
POST /api/app/bikes/search
Authorization: Bearer <alexAccessToken>
Content-Type: application/json

{ "available": true, "$refDepth": 0 }
```

If `bike-01` belongs to Alex, he can change its price:

```http
PATCH /api/app/bikes/object/bike-01?$refDepth=0
Authorization: Bearer <alexAccessToken>
Content-Type: application/json

{ "$set": { "price": 20 } }
```

| Operation with this `ru` rule | Result |
| --- | --- |
| Read or update Alex's bike | Allowed |
| Read or update another owner's bike | Denied |
| Change `owner.value` to someone else's ID | Denied: updates must match the rule before and after the change |
| Create a bike or delete Alex's bike | Denied: the rule has neither `c` nor `d` |

The same read filter also limits queries, aggregations, and vector searches. These do not bypass permissions.

</details>

<details>
<summary>Build broader access</summary>

To let Alex create and delete matching objects too, an administrator updates his rule to `crud`:

```http
PATCH /api/app/users/object/alex
Authorization: Bearer <adminAccessToken>
Content-Type: application/json

{
  "$set": {
    "permissions": [
      {
        "name": "My bikes",
        "query": { "owner.value": "person-42" },
        "perm": "crud"
      }
    ]
  }
}
```

For access to every bike, collection grants are another option. This adds collection-wide reads without a collection-wide write grant:

```json
{
  "collectionPermissions": {
    "read": ["bikes"],
    "write": []
  }
}
```

Store these fields on the user object. A `write` grant allows create, update, and delete across that collection; it does not imply `read`.

Add more entries to `permissions` for other groups of objects. Rules and grants add access: a broad grant is not narrowed by an object rule.

After changing permissions, Alex must sign in again or renew his token to receive the new permissions.

</details>

[Authentication](/content/api.md?id=authentication) · [Permissions](/content/api.md?id=permissions)

### Clusters :id=clusters

Grow beyond one machine with two different building blocks:

- **Shards** divide the objects across nodes.
- **Replicas** keep additional copies of a shard on other nodes.

Requests can reach any public node; routing finds the owner. Replicas catch up asynchronously.

![Two object shards live on different machines, with one additional replica of each on another machine.](assets/site/learn/cluster.svg)

[Cluster setup](/content/server.md?id=clustering)

### Persistence :id=persistence

Choose what survives a restart:

- **Local WAL** records writes on the node. With `localWal` acknowledgement, success follows the local flush.
- **Optional S3** keeps journals and snapshots asynchronously.
- **Recovery** restores objects and rebuilds indexes in memory.

A local WAL acknowledgement does not wait for replicas or S3 uploads.

[Persistence settings](/content/server.md?id=durability) · [Run OBJY](get-started.md)
