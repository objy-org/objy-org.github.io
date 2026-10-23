# objy.db

objy.db is an in-memory, sharded, replicated database for dynamic objects. Objects can have different shapes, live in collections, and link to other objects through references.

[Back to the website](../ ":ignore :target=_self")

## Abstract objects

Each object has a unique `_id`. Its other properties can contain strings, numbers, booleans, arrays, nested objects, or `null`. Collections do not need a fixed schema before objects are inserted.

```json
{
  "_id": "bike-001",
  "color": "coral",
  "available": true,
  "owner": {
    "type": "reference",
    "collection": "people",
    "value": "person-001"
  }
}
```

References store the target collection and object ID. Reads can expand references to return connected objects.

Collection hooks enable server-registered validation, transformations, and other behavior around public create, read, update, and delete operations. Optional extensions add inheritance and lifecycle actions. Scheduled event execution needs a separate scheduler; it is not an automatic feature of the core database.

## Memory, compression, and columns

Objects and indexes live in memory. Collection metadata configures how fields are indexed, represented in columns, or compressed:

```json
{
  "indexes": ["status"],
  "columns": ["score"],
  "tiering": {
    "mode": "compressedMemory",
    "keep": ["name", "status"],
    "minBytes": 4096
  }
}
```

- `indexes` narrow candidate objects for filtering and supported sorting.
- `columns` keep selected values in compact column storage, helping aggregate queries avoid reading complete objects.
- `tiering` compresses less-used fields in memory. Use `keep` to select fields to retain uncompressed, or `offload` to select fields to compress; do not combine both.

Indexed and column fields remain hot automatically. Reads still return complete objects. Queries on non-indexed compressed fields can require decompression during a scan.

## Persistence

S3-compatible storage holds journals and snapshots. Nodes restore snapshots, replay newer journals, and rebuild indexes when they start.

Write acknowledgement is configurable. Memory acknowledgement confirms acceptance in RAM. Local-WAL acknowledgement waits for a local write-ahead-log flush. Persistence and replication should be configured around the recovery guarantees your application needs.

## Run a node

From a database source checkout with Node.js installed:

```sh
npm ci
node src/index.js --config spread-db.config.json --node node-a --url http://localhost:8080 --port 8080
```

The database console is served at the node's root URL. Use the database repository's configuration examples for your storage and cluster settings. The repository also supplies a Dockerfile for container deployments.

## Deploy a cluster

Run as a Node.js process or a Docker container on suitable local machines, virtual machines, on-premises infrastructure, or cloud servers. A persistent deployment needs reachable S3-compatible storage and the configured local WAL directory when WAL is enabled.

A shared shard map assigns objects to shards. Each shard has one or more replicas. Nodes route requests to the owning shard, and replicas synchronize asynchronously. Shards add logical capacity; replicas add copies and consume additional physical memory.

Topology changes are planned operations. The deployment tooling supports a maintenance workflow that stops traffic, resizes the topology, restores data into the new shard layout, verifies readiness, and reopens traffic. This is not automatic, zero-downtime scaling.

## Clients and APIs

The database exposes an HTTP API. Object routes use this shape:

```text
/api/{database}/{collection}/object/{id}
```

The database also ships a JavaScript client at `/client.js` for browser imports and `objydb/client` for Node.js applications. Its admin console exposes object browsing, metadata, indexes, and cluster status.

This overview follows the current OBJY DB implementation. The repository's older framework documentation remains available at [Legacy object framework documentation](DOCUMENTATION.md).
