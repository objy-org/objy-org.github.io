# Objects at the center. :id=features

Explore the core engine and the services around it. One feature at a time.

## Database core :id=database-core

The same engine in browsers and Node.js. Examples use an existing `items` collection. [Core docs](/content/database.md).

### ![](assets/site/icons/features/flexible-objects.svg) Flexible objects :id=flexible-objects

Nested properties, arrays, and different shapes in one collection. No rigid schema to work around.

```json
{
  "name": "Survey drone",
  "battery": 87,
  "capabilities": ["mapping", "thermal"]
}
```

### ![](assets/site/icons/features/live-references.svg) Live references :id=live-references

Connect objects without storing copies. Reads can expand the current referenced object under `.object`.

```json
{
  "operator": {
    "type": "reference",
    "collection": "people",
    "value": "person-42"
  }
}
```

### ![](assets/site/icons/features/in-memory.svg) In-memory speed :id=in-memory

Objects and their indexes live in memory. The core reads directly from the JavaScript heap.

### ![](assets/site/icons/features/hot-compressed.svg) Smart compression :id=hot-compressed

Keep frequently used fields hot. Compress the rest through collection metadata, then hydrate it on read.

```json
{
  "tiering": {
    "mode": "compressedMemory",
    "keep": ["name", "status"]
  }
}
```

### ![](assets/site/icons/features/columns.svg) Compact columns :id=compact-columns

Store selected values in compact columns for fast numeric aggregation. Reads still return complete objects.

```json
{ "columns": ["score"] }
```

### ![](assets/site/icons/features/shared-values.svg) Shared dictionaries :id=shared-values

Repeated values share dictionary entries internally, reducing memory use without changing your objects.

### ![](assets/site/icons/features/metadata.svg) Collection metadata :id=collection-metadata

Declare indexes, columns, and compression once per collection. Your object data stays clean.

```json
{
  "indexes": ["status"],
  "columns": ["score"]
}
```

### ![](assets/site/icons/features/vector-search.svg) Vector search :id=vector-search

Bring your own embeddings in `_vec`. Search them with a built-in HNSW index alongside your objects.

```js
await items.search({
  $vector: {
    vector: [0.2, 0.8],
    limit: 5
  }
});
```

### ![](assets/site/icons/features/query-aggregate.svg) Query & aggregate :id=query-aggregation

Filter and sort objects. Group, count, sum, or average data with the same query engine.

```js
await items.search({
  status: 'active',
  $aggregate: {
    fields: { total: { $sum: 'score' } }
  }
});
```

### ![](assets/site/icons/features/bulk-operations.svg) Bulk operations :id=bulk-operations

Write one object or a batch through the same storage path. Bulk operations are built into the engine.

```js
await items.insertMany([
  { _id: 'one', score: 9 },
  { _id: 'two', score: 4 }
]);
```

### ![](assets/site/icons/features/cross-runtime.svg) Browser & Node.js :id=cross-runtime

Embed the same database engine in browsers and Node.js. The API stays the same in both.

```js
import { createDatabase } from '@objy/db';
const objy = createDatabase();
```

## DB server :id=db-server

APIs, security, and scale around the core. Client examples assume an authenticated connection. [Server docs](/content/server.md).

### ![](assets/site/icons/features/rest-client.svg) REST & JavaScript :id=rest-client

Connect apps and services over HTTP, directly or through the lightweight `@objy/client` package.

```js
import { createClient } from '@objy/client';
const client = createClient({
  url: 'http://localhost:8080'
});
```

### ![](assets/site/icons/features/authentication.svg) Users & authentication :id=authentication

Manage user identities and sessions in your database backend. Sign in against an authentication-enabled collection.

```js
await client.login({
  database: 'app',
  username: 'alex',
  password: 'your-password'
});
```

### ![](assets/site/icons/features/permissions.svg) Object permissions :id=object-permissions

Combine collection grants, admin roles, and query-based object rules. This user rule permits access to their own objects.

```json
{
  "permissions": [{
    "name": "Own objects",
    "query": { "ownerId": "alex" },
    "perm": "crud"
  }]
}
```

### ![](assets/site/icons/features/files.svg) Files as objects :id=file-objects

Keep metadata in an object and the blob in S3. The same object permissions protect the file.

```js
await items.insertFile(
  { name: 'notes.txt' },
  new Blob(['Hello OBJY']),
  { filename: 'notes.txt' }
);
```

### ![](assets/site/icons/features/hooks.svg) Operation hooks :id=operation-hooks

Add server-registered behavior around object operations. Enable the registered hooks through collection metadata.

```json
{
  "hooks": {
    "use": ["audit", "timestamps"]
  }
}
```

### ![](assets/site/icons/features/sharding.svg) Object sharding :id=object-sharding

Distribute objects across machines. Public requests can reach any node and are routed to the owning shard.

### ![](assets/site/icons/features/replication.svg) Async replication :id=replication-recovery

Keep copies on other nodes. Replicas catch up after interruptions; replication converges asynchronously.

### ![](assets/site/icons/features/s3-durability.svg) Optional S3 durability :id=s3-durability

Add a local write-ahead log, S3 journals, and snapshots for persistence and recovery. Enable it when your deployment needs durability.

### ![](assets/site/icons/features/streaming-import.svg) Streaming imports :id=streaming-import

Stream NDJSON into bounded batches. Import an iterable without first building one huge array in memory.

```js
await items.import(async function* () {
  yield { _id: 'one', score: 9 };
  yield { _id: 'two', score: 4 };
});
```

### ![](assets/site/icons/features/cluster-console.svg) Cluster console :id=cluster-console

See memory, replication, readiness, and topology in the server administration console.
