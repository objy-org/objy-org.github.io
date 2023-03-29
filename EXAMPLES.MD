# Examples


# Remote OBJY

SPOO is a project for exposing any OBJY environment as a RESTful platform.

> For running a basic platform you will need ***Node.js***, ***Redis*** and ***MongoDB***. This will change in the future. The following quick examples show you how to spin up a platform and a client with just a few lines of code.

***Server***

```shell
npm i objy spoojs
```

```javascript
const OBJY = require('objy');
const SPOO = require('spoojs');

OBJY.define({
  name: "user",
  pluralName: "users",
  authable: true
})

OBJY.define({
  name: "object",
  pluralName: "objects"
})

SPOO.REST({
  OBJY,
}).run()
```

***Client***

Connect to a SPOO instance

```html
<script src="https://cdn.jsdelivr.net/npm/objy-connect/index.js">
```
or
```shell
npm i objy-connect
```

```javascript
let remote = new CONNECT(OBJY)

OBJY.define({
  name: "object",
  pluralName: "objects",
  storage: remote
})

// Login
remote.connect({client: "myclient", url: "https://mydomain.com/api", username: "user", password: "***"}, () => {
  OBJY.objects({}).get(data => {
    console.log('data:', data)
  }, err => {
    console.log('err:', err)
  })
})
```