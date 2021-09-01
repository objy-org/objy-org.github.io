# Ecosystem

The OBJY project comes with an ecosystem of plugins, tools and products.

## OBJY Catalog

[Github](https://github.com/objy-org/objy-catalog)

A collection of adapters for using the right technologies for specific use cases and building domain specific object families. 

### Getting Started

> Install via npm

```
npm install objy-catalog
```

OBJY Mappers are written in JavaScript and can be installed along with the OBJY Framework. They are used to define custom Object Families with the fitting technologies underneath.

There are three types of mappers: Persistence, Processing and Observation.


| Mapper Type | Description | Examples
--- | --- | ---
|Persistence| Used to store objects and delegate CRUD operations | Database Systems, File Systems or Caches.
Processor | Used to execute object actions, event actions and handler actions |  Anything that executes JS Code, like eval or the VM Module. Can be proxied with Messaging Systems.
Observer | Observes object events and execute their actions. | Cron-based solutions or event schedulers


### Example

Let's create an Object Family that uses the following mappers:

```
const CATALOG = require('objy-catalog');

// Define an object family
OBJY.define({
   name : "Object",
   pluralName: "Objects",
   persistence: new CATALOG.mappers.storage.mongo(),
   observer: new CATALOG.mappers.observers.interval(),
   processor: new CATALOG.mappers.processors.eval()
})

// Use the object family's constructor
OBJY.Object({name: "Hello World"}).add(function(data)
{
   console.log(data);
})
```

## SPOO

[SPOO Website](https://spoo.io)  [Github](https://github.com/spootechnologies/spoo)

SPOO is a JS framework for building custom platforms.
The following quick examples show you how to spin up a platform and a client with just a few lines of code.

![Platform](https://spoo.io/assets/img/platform.png)

> For running a basic platform you will need ***Node.js***, ***Redis*** and ***MongoDB***

### Spin up a basic Platform

```shell
npm i spoojs
```

```javascript
// 1. import spoo
const SPOO = require('spoojs');

// 2. define some "object wrappers"
SPOO.define({
  name: "user",
  pluralName: "users",
  authable: true
})

SPOO.define({
  name: "object",
  pluralName: "objects"
})

// 3. run the platform via REST
SPOO.REST({
  port:80,
  metaMapper: new SPOO.metaMappers.mongoMapper().connect("mongodb://localhost") // The matamapper is for basic config
}).run()
```

### Set up a Client (JavaScript SDK)

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
