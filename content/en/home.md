<!-- Edit the words and images using Markdown. Keep each :id=... so menu links continue to work. -->

# Fast, large-scale<br> in-memory object database. :id=top

> Build applications around fast objects.

Flexible JSON objects. Live references. Efficient storage.\
Build your application on OBJY, with API, authentication, users, and permissions built in.

![CRUD, queries, aggregation, and vector search lead to one JSON object. Three simple storage tiers sit behind it: hot fields, compact columns, and compressed bodies. Optional S3 durability sits below.](assets/site/architecture.svg)

[Show more features →](/features.md)

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

## Start with one node. :id=start-building

Get OBJY running, create your first object, and build from there.

- [Read the Quick Start →](/content/server.md?id=start-one-node)
- [Explore cluster setup](/content/server.md?id=form-a-cluster)

---

[OBJY · Build around objects.](/?id=top) · [View on GitHub ↗](https://github.com/objy-org/objy)
