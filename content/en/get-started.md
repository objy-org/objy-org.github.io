# Deploy on your terms. :id=deployment

## ![](assets/site/icons/quick-start.svg) Run locally :id=deploy-quick-start

```sh
npm i -g @objy/server
objy run
```

[Quick-start guide](/content/server.md?id=server-and-cluster)

## ![](assets/site/icons/server.svg) Run a cluster :id=deploy-cluster

```sh
npm i -g @objy/server
objy start --instances 4
objy status
```

[Cluster setup](/content/operations.md?id=server)

## ![](assets/site/icons/cloud.svg) Bring your own cloud :id=bring-your-own-cloud

- [Hetzner](https://www.hetzner.com/cloud/)
- [IONOS](https://cloud.ionos.com/)
- [Google Cloud](https://cloud.google.com/)
- [AWS](https://aws.amazon.com/)
- [Azure](https://azure.microsoft.com/)

[Server setup](/content/server.md?id=server-and-cluster)

## ![](assets/site/icons/browser.svg) Run in the browser :id=deploy-browser

```js
import { createDatabase } from "@objy/db";
const objy = createDatabase();
```

[Browser guide](/content/server.md?id=browser)
