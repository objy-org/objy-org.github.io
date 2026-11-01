# Deploy on your terms. :id=deployment

## ![](assets/site/icons/quick-start.svg) Local servers :id=deploy-run

```sh
npm i -g @objy/server
```

### One node :id=deploy-quick-start

```sh
objy run
```

[Quick-start guide](/content/server.md?id=start-one-node)

### Cluster :id=deploy-cluster

```sh
objy start --instances 4
objy status
```

[Cluster setup](/content/server.md?id=form-a-cluster)

## ![](assets/site/icons/cloud.svg) Bring your own cloud :id=bring-your-own-cloud

- [Hetzner](https://www.hetzner.com/cloud/)
- [IONOS](https://cloud.ionos.com/)
- [Google Cloud](https://cloud.google.com/)
- [AWS](https://aws.amazon.com/)
- [Azure](https://azure.microsoft.com/)

[Server setup](/content/server.md?id=start-one-node)

## ![](assets/site/icons/database.svg) Embedded :id=deploy-embedded

Run the same database directly in browsers and Node.js.

```sh
npm i @objy/db
```

```js
import { createDatabase } from "@objy/db";
const objy = createDatabase();
await objy.createDatabase("app");
```

[Browser setup](/content/database.md?id=install-in-a-browser) · [Node.js setup](/content/database.md?id=install-in-nodejs)
