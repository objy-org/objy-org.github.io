<!-- Edit the words and images using Markdown. Keep each :id=... so menu links continue to work. -->

# Fast in-memory objects. **Power your apps and agents.** :id=top

> Large Scale In-Memory Object Database

Build around flexible objects. Combine dynamic properties, live references, and vectors—then query, aggregate, and search it all in memory.

- ![](assets/site/icons/features/flexible-objects.svg) Flexible JSON
- ![](assets/site/icons/features/query-aggregate.svg) OLTP · OLAP · Vector
- ![](assets/site/icons/features/hot-compressed.svg) Efficient storage
- ![](assets/site/icons/features/authentication.svg) API, auth & permissions

![Hundreds of empty JSON object brackets form a deep object field, with apps, AI agents, and APIs connected to individual objects.](assets/site/applications-objects-scale.svg)


## The OBJY advantage. :id=feature-highlights

### CRUD, analytics, and vector search. One API. :id=versatile-api

Create and update objects, explore their data, or find similar ones. One API for application logic, analytics, and AI.

![CRUD, query, aggregation, and vector search feed into the same object API.](assets/site/architecture.svg#api)

### Flexible objects. For apps and agents. :id=flexible-objects

Start with JSON. Add nested properties, arrays, live references, or vectors as your model evolves. Your app and its agents work with the same objects.

![A flexible task object combines its title and status with tags, nested details, and a vector.](assets/site/architecture.svg#objects)

<details>
<summary>Store → find → update. See the code.</summary>

Run `npm install @objy/client`, then connect to a running local server with the administrator password printed by the CLI. Use a new database name for this example.

```js
import { createClient } from "@objy/client";

const client = createClient({ url: "http://localhost:8080" });
await client.login({ username: "admin", password: "<printed-password>" });

await client.createDatabase("app");
const app = client.database("app");
await app.createCollection("tasks");
const tasks = app.collection("tasks");

// An object can combine different kinds of properties.
await tasks.insert({
  _id: "task-01",
  title: "Launch website",
  status: "open",
  tags: ["design", "AI"],
  details: { priority: 2 },
  _vec: [0.2, 0.8, 0.4]
});

// Find objects by their properties.
const matches = await tasks.find({ status: "open" });

// Add a nested property as your application evolves.
await tasks.patch(matches[0]._id, {
  $set: { status: "ready", "details.reviewed": true }
});
```

The vector is illustrative; your application generates its embeddings. [Start a server →](/get-started/local.md)

</details>

### In-memory speed. Clever storage. :id=hot-compressed

Keep frequently used fields hot, aggregate over compact columns, and compress colder data. Objects stay in memory without keeping every field in the same form.

![One RAM module stores hot fields, compact columns, and compressed data.](assets/site/architecture.svg#memory)

[Explore how OBJY works →](/learn.md)

## What will you build? :id=object-capabilities

### ![](assets/site/icons/use-cases/agents.svg) AI agents & memory :id=use-case-agents

Store memories and embeddings together. Retrieve relevant context with vector search.

### ![](assets/site/icons/use-cases/analytics.svg) Analytics :id=use-case-analytics

Explore your data with fast filters and aggregations. Calculate metrics directly from your objects.

### ![](assets/site/icons/use-cases/apps.svg) Application backends :id=use-case-apps

Build tools and SaaS apps with APIs, authentication, users, and permissions already in place.

### ![](assets/site/icons/use-cases/anything.svg) Or anything else... :id=use-case-anything

Your objects. Your ideas. Build whatever comes next.

---

[OBJY · Build around objects.](/?id=top) · [View on GitHub ↗](https://github.com/objy-org/objy)
