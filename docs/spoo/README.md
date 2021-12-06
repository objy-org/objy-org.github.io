# Quickstart 

Welcome to the SPOO Documentation. Here you'll find the docs for the SPOO framework as well as for the JS Client SDK and REST API.
The following quick examples show you how to spin up a platform and a client with just a few lines of code.

![Platform](https://spoo.io/assets/img/platform.png)

> For running a basic platform you will need ***Node.js***, ***Redis*** and ***MongoDB***

# Spin up a basic (minimal) platform

```shell
npm i spoojs objy
```

```javascript
// 1. import spoo
const SPOO = require('spoojs');
const OBJY = require('objy');

// 2. define some "object wrappers"
OBJY.define({
  name: "user",
  pluralName: "users",
  authable: true
})

OBJY.define({
  name: "object",
  pluralName: "objects"
})

// 3. run the platform via REST
SPOO.REST({
  port:80,
  OBJY,
  metaMapper: new SPOO.metaMappers.mongoMapper().connect("mongodb://localhost") // The matamapper is for basic config
}).run()
```

# Spin up a real-life (advanced) platform

```shell
npm i spoojs objy objy-catalog
```

```javascript
// 1. import spoo
const SPOO = require('spoojs');
const OBJY = require('objy');
const OBJY_CATALOG = require('objy-catalog');

// Define a mongo connection (for use with multiple object families)
var mongoCon = new OBJY_CATALOG.mappers.storage.mongo(OBJY).connect('mongodb://localhost', function(data) {
    console.info('mongo connected')
}, function(err) {
    console.info('mongo not connected:', err)
});

// 2. define some "object wrappers"
OBJY.define({
  name: "user",
  pluralName: "users",
  authable: true,
  // Attach a mongo mapper with the previously initialized mongo connection
  storage: new OBJY_CATALOG.mappers.storage.mongo(OBJY).useConnection(mongoCon.getConnection(), function() {})
})

OBJY.define({
  name: "object",
  pluralName: "objects",
  storage: new OBJY_CATALOG.mappers.storage.mongo(OBJY).useConnection(mongoCon.getConnection(), function() {})
})

// 3. run the platform via REST
SPOO.REST({
  port:80,
  OBJY,
  // Use a "message mapper" which handles internal email communication (e.g. reset passwort, etc).
  messageMapper: new SPOO.messageMappers.sendgridMapper().connect("API_KEY"),
  metaMapper: new SPOO.metaMappers.mongoMapper().connect("mongodb://localhost"),
  // Specify redis connection for handling user sessions. Defaults to localhost
  redisCon: {
      host: "redis host",
      port: 6380,
      password: "bla"
  }
}).run()
```

# Set up a Client (JavaScript SDK)

> Install via npm or script tag:

```html
<script src="https://cdn.jsdelivr.net/npm/@spootechnologies/spooclient@0.0.13/index.js">
```
or
```shell
npm i @spootechnologies/spooclient
```

```javascript
// 1. Initialize the client
const spoo = new SPOO_Client('mytenant');

// 2. Authenticate a user
spoo.io().auth("user", "pass", function(data, err){
  if(!err) console.log('you are in!');
})

// Add an object
spoo.io().object({
  name: "Mercedes",
  type: "car",
  properties: {
    owner : {
      type: "shortText",
      value: "Peter Griffin"
    }
  }
}).add(function(data, err)
{
  if(err) return console.error(err);
  console.log(data); // {...object...}
})

// Modify an object
spoo.io().object("objectid...").addProperty({
  color: {
    type: "shortText",
    value: "red"
  }
}).save(function(data, err)
{
  if(err) return console.error(err);
  console.log(data); // {...updated object...}
})
```

## Authors

* **Marco Boelling** - *Creator* - [Twitter](https://twitter.com/marcoboelling)

## License

SPOO is open source and licensed under the GNU Affero General Public License.

## Further reading

* For more information on SPOO, go to [spoo.io](https://spoo.io)