# Deine Anwendung. Dein Betrieb. :id=deployment

## ![](assets/site/icons/quick-start.svg) Lokal starten :id=deploy-quick-start

```sh
npm i -g @objy/server
objy run
```

[Schnellstart-Anleitung](/content/server.md?id=server-and-cluster)

## ![](assets/site/icons/server.svg) Cluster starten :id=deploy-cluster

```sh
npm i -g @objy/server
objy start --instances 4
objy status
```

[Cluster einrichten](/content/operations.md?id=server)

## ![](assets/site/icons/cloud.svg) Deine eigene Cloud :id=bring-your-own-cloud

- [Hetzner](https://www.hetzner.com/cloud/)
- [IONOS](https://cloud.ionos.com/)
- [Google Cloud](https://cloud.google.com/)
- [AWS](https://aws.amazon.com/)
- [Azure](https://azure.microsoft.com/)

[Server einrichten](/content/server.md?id=server-and-cluster)

## ![](assets/site/icons/browser.svg) Im Browser starten :id=deploy-browser

```js
import { createDatabase } from "@objy/db";
const objy = createDatabase();
```

[Browser-Anleitung](/content/server.md?id=browser)
