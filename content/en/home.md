<!-- Edit the words and images using Markdown. Keep each :id=... so menu links continue to work. -->

# Fast, large-scale<br> in-memory object database. :id=top

> Build applications around fast objects.

Flexible JSON objects. Live references. Efficient storage.\
Build your application on OBJY, with API, authentication, users, and permissions built in.

![Apps, AI agents, and APIs share floating JSON objects and arrays through sweeping arrows.](assets/site/applications-objects.svg)

## More than JSON. :id=abstract-objects

Dynamic properties, nested data, unique identities, and live references. Model objects your way, and evolve them as your application grows.

![Two JSON objects: a device references a person in the people collection. An arrow connects the reference value person-42 to the matching object identity.](assets/site/abstract-objects.svg?v=2)

## CRUD, aggregations, vector search. One API. :id=simple-api

Create, read, update, and delete. Query, aggregate, and search by vector through one API.

![Query, Vector, CRUD, and Aggregate share one API connection.](assets/site/simple-api.svg)

## Run anywhere. Scale out. :id=run-and-deploy

Start in a browser or on a server. Distribute objects across a cluster as your data and workload grow.

![A browser window, a single server, and three connected servers show deployment from the browser to a horizontally scaled cluster.](assets/site/run-and-deploy.svg)

## Users & access. Built in. :id=users-and-access

Users, authentication, permissions, and role-based access control. Define who can read, write, and administer.

![User identities connect to a login lock and an access-control shield.](assets/site/users-access.svg)

## Your world. As objects. :id=object-capabilities

Live references, nested data, vectors, and files. Different shapes. The same object model.

### Device :id=example-device

> app / devices / drone-01

```json
{
  "_id": "drone-01",
  "name": "Survey drone",
  "online": true,
  "telemetry": {"altitude": 120, "battery": 87},
  "capabilities": ["mapping", "thermal"],
  "operator": {
    "type": "reference",
    "collection": "people",
    "value": "person-42"
  }
}
```

### AI memory :id=example-memory

> app / memories / memory-01 · vector on insert

```json
{
  "_id": "memory-01",
  "title": "Roof inspection",
  "text": "Solar panels need cleaning.",
  "tags": ["inspection", "solar"],
  "_vec": [0.12, -0.43, 0.87],
  "source": {
    "type": "reference",
    "collection": "files",
    "value": "scan-01"
  }
}
```

### File :id=example-file

> app / files / scan-01 · after upload

```json
{
  "_id": "scan-01",
  "name": "roof-scan.jpg",
  "tags": ["aerial", "inspection"],
  "resolution": {"width": 4096, "height": 2160},
  "_file": {
    "storage": "s3",
    "key": "spread-db/files/db/app/collection/files/object/scan-01/blob/f7x2",
    "mimeType": "image/jpeg"
  }
}
```

### Query :id=example-query

> app / devices · online mapping drones, highest battery first

```js
const devices = client.database('app').collection('devices');

await devices.find(
  {
    online: true,
    'telemetry.battery': { $gte: 50 },
    capabilities: { $contains: 'mapping' }
  },
  { sortBy: 'telemetry.battery', sort: 'desc', limit: 10 }
);
```

### Aggregation :id=example-aggregation

> app / devices · fleet statistics by online status

```js
const devices = client.database('app').collection('devices');

await devices.search({
  $aggregate: {
    groupBy: 'online',
    fields: {
      devices: { $count: true },
      avgBattery: { $avg: 'telemetry.battery' },
      maxAltitude: { $max: 'telemetry.altitude' }
    }
  }
});
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
