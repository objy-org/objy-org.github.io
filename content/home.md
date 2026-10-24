<!-- Edit the words and images using Markdown. Keep each :id=... so menu links continue to work. -->

# Build applications around fast objects. **In memory. Scalable.** :id=top

![Apps, AI agents, and APIs share floating JSON objects and arrays through sweeping arrows.](assets/site/applications-objects.svg)

## Simple API :id=simple-api

Create, read, update, and delete objects through one simple API. Query, aggregate, and find similar objects with vector search.

![Four large API capabilities—Query, Vector, CRUD, and Aggregate—each have their own icon and share one API connection.](assets/site/simple-api.svg)


## JSON with extras :id=abstract-objects

Model anything with flexible JSON objects, unique identities, and live references.

![A JSON object with an identity, color, availability, and an owner reference to a person in the people collection.](assets/site/abstract-objects.svg)


## Runs everywhere, scalable :id=run-and-deploy

Run in browsers, on servers, or across clusters. Scale horizontally by adding nodes as your application grows.

![A browser window, a single server, and three connected servers show deployment from the browser to a horizontally scaled cluster.](assets/site/run-and-deploy.svg)

## Storage internals :id=storage-internals

Each object is split internally into smart blocks for fast access and efficient storage.

- **Hot fields:** Frequently used fields stay uncompressed in memory for fast access.
- **Compact columns:** Selected values sit together for efficient scans and analytics.
- **Compressed fields:** certain data stays compressed in memory and expands when read - for efficient memory usage.

![A complete JSON object sits in front of three visible internal storage tiers: hot fields, compact columns, and compressed fields, all in memory.](assets/site/storage-internals.svg)

## Objects that do more. :id=object-capabilities

Give every object its own shape, connections, and rules.

- **Dynamic properties:** Add or change fields freely. Mix values, arrays, and nested objects without a fixed schema.
- **Real-time references:** Connect objects across collections and resolve their latest values when you read.
- **Users and permissions:** Users are objects, too. Built-in authentication and collection permissions control who can read or make changes.

![A JSON object gains a new property, links to a user object, and connects to read and write permissions.](assets/site/object-capabilities.svg)

## Deploy on your terms. :id=deployment

From local development to distributed clusters, choose how your applications connect to their objects.

### Locally :id=deploy-locally

Start a local instance with Node.js or Docker. Build, explore, and test your application on your own machine.

- [GitHub](https://github.com/objy-org)
- [Run locally](DATABASE.md?id=run-a-node)

### Cluster :id=deploy-cluster

Deploy nodes across VMs, containers, or separate processes. Distribute objects across shards and keep replicas across nodes.

- [Cluster setup](DATABASE.md?id=deploy-a-cluster)

### Bring your own cloud :id=bring-your-own-cloud

Choose your provider and run on infrastructure you control, with your own networking and S3-compatible storage.

- [Hetzner](https://www.hetzner.com/cloud/)
- [IONOS](https://cloud.ionos.com/)
- [Google Cloud](https://cloud.google.com/)
- [AWS](https://aws.amazon.com/)
- [Azure](https://azure.microsoft.com/)

### Browser :id=deploy-browser

Connect your web app to objy.db with the JavaScript client. Read, update, and query objects directly from your interface.

- [JavaScript client](DATABASE.md?id=clients-and-apis)
