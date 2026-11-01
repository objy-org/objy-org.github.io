# Deine Anwendung. Dein Betrieb. :id=deployment

## ![](assets/site/icons/quick-start.svg) Lokal :id=deploy-run

```sh
npm i -g @objy/server
```

### Ein Knoten :id=deploy-quick-start

```sh
objy run
```

[Schnellstart-Anleitung](/content/server.md?id=start-one-node)

### Cluster :id=deploy-cluster

```sh
objy start --instances 4
objy status
```

[Cluster einrichten](/content/server.md?id=form-a-cluster)

## ![](assets/site/icons/cloud.svg) Deine eigene Cloud :id=bring-your-own-cloud

- [Hetzner](https://www.hetzner.com/cloud/)
- [IONOS](https://cloud.ionos.com/)
- [Google Cloud](https://cloud.google.com/)
- [AWS](https://aws.amazon.com/)
- [Azure](https://azure.microsoft.com/)

[Server einrichten](/content/server.md?id=start-one-node)

## ![](assets/site/icons/database.svg) Embedded :id=deploy-embedded

Dieselbe Datenbank direkt im Browser und in Node.js nutzen.

```sh
npm i @objy/db
```

```js
import { createDatabase } from "@objy/db";
const objy = createDatabase();
await objy.createDatabase("app");
```

[Browser einrichten](/content/database.md?id=install-in-a-browser) · [Node.js einrichten](/content/database.md?id=install-in-nodejs)
