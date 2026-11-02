# Embedded :id=deploy-embedded

Dieselbe Datenbank direkt im Browser und in Node.js nutzen.

## Installation :id=install-embedded

```sh
npm i @objy/db
```

## Browser und Node.js :id=embedded-runtime

```js
import { createDatabase } from "@objy/db";
const objy = createDatabase();
await objy.createDatabase("app");
```

[Browser einrichten](/content/database.md?id=install-in-a-browser) · [Node.js einrichten](/content/database.md?id=install-in-nodejs)
