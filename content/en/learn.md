# Learn OBJY. :id=learn

One small project. Five ideas that make objects powerful.

## Start with an object. :id=objects

Meet Orbit, a project in our application. Its object holds a name, a status, a score, and a list of tags. Add nested properties or new fields as the project grows; a collection does not require every object to have the same shape.

![The Orbit project as a JSON object, with an ID, text, a numeric score, and an array of tags.](assets/site/learn/objects.svg)

[Explore the object model](/content/api.md?id=objects)

## Connect your objects. :id=references

Orbit belongs to Alex. Store a reference to Alex's object in the `people` collection. When reading Orbit, OBJY can resolve Alex's current data under `owner.object`. Update Alex once; later reads can resolve the new value.

```json
{
  "owner": {
    "type": "reference",
    "collection": "people",
    "value": "person-42"
  }
}
```

![Orbit points to Alex through its owner reference. Reading the reference exposes Alex under owner.object, without storing another copy.](assets/site/learn/references.svg)

[Explore references](/content/api.md?id=live-references)

## Shape your collections. :id=collections

A collection groups objects such as our projects. Its metadata tells OBJY how to organize them: index `status`, store `score` in a compact column, and keep selected fields hot while compressing larger object bodies. Objects still read back as objects.

```json
{
  "indexes": ["status"],
  "columns": ["score"],
  "tiering": {
    "mode": "compressedMemory",
    "keep": ["name", "status"]
  }
}
```

![The projects collection holds Orbit and other objects. A shared metadata layer configures indexes, columns, and tiering.](assets/site/learn/collections.svg)

[Explore collection metadata](/content/database.md?id=shape-the-workload-with-metadata)

## Work with one API. :id=operations

Create, read, update, and delete your projects. Use queries to find matching objects, aggregation to calculate totals, and vector search to find similar embeddings. The same object model supports each operation.

For the `projects` collection, this query finds active projects scoring at least 40:

```js
await projects.find({
  status: "active",
  score: { $gte: 40 }
});
```

![CRUD, query, aggregation, and vector operations all connect to the same Orbit project object.](assets/site/learn/apis.svg)

[Explore querying](/content/api.md?id=query) · [Aggregation](/content/api.md?id=aggregation) · [Vector search](/content/api.md?id=vector-search)

## Keep it in memory. :id=memory

Your objects and their lookup structures live in RAM. Hot fields stay directly accessible, columns keep selected values compact, and compressed fields unpack when needed. Metadata lets you choose the balance for your workload.

Run the engine inside a browser or Node.js application. The DB server adds authentication, permissions, shared access, clusters, and optional durability around the same core.

![Orbit enters a RAM-shaped storage layer with three blocks: hot fields, compact columns, and compressed data.](assets/site/learn/memory.svg)

[Explore the engine](/content/database.md?id=memory-is-the-database) · [Get started](get-started.md) · [DB server](/content/server.md?id=what-the-server-adds)
