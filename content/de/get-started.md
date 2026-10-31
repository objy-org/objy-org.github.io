# Deine Anwendung. Dein Betrieb. :id=deployment

## ![](assets/site/icons/quick-start.svg) Lokal starten :id=deploy-quick-start

```sh
npm i -g @objy/server
objy run
```

[Schnellstart-Anleitung](/content/server.md?id=start-one-node)

## ![](assets/site/icons/server.svg) Cluster starten :id=deploy-cluster

```sh
npm i -g @objy/server
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

## ![](assets/site/icons/browser.svg) Im Browser starten :id=deploy-browser

```js
import { createDatabase } from "@objy/db";
const objy = createDatabase();
```

[Browser-Anleitung](/content/database.md?id=install-in-a-browser)

## ![](assets/site/icons/database.svg) In Node.js einbetten :id=deploy-embedded

```sh
npm i @objy/db
```

```js
import { createDatabase } from "@objy/db";
const objy = createDatabase();
await objy.createDatabase("app");
```

[Anleitung zum Einbetten](/content/database.md?id=install-in-nodejs)
