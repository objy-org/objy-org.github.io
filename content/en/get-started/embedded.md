# Embedded :id=deploy-embedded

Run the same database directly in browsers and Node.js.

## Install :id=install-embedded

```sh
npm i @objy/db
```

## Browser and Node.js :id=embedded-runtime

```js
import { createDatabase } from "@objy/db";
const objy = createDatabase();
await objy.createDatabase("app");
```

[Browser setup](/content/database.md?id=install-in-a-browser) · [Node.js setup](/content/database.md?id=install-in-nodejs)
