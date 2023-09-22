# Customize Objects

Object families are groups of objects, that have the same origin.
In it's simplest form, objects live in memory.

```javascript
// Define an object family

OBJY.define({
	name: "object", // singular constructor name
	pluralName: "objects" // plural constructor name
})

// OBJY now has the contructors:
OBJY.object() // as a family for single objects
OBJY.objects() // as family for multiple objects
```


## Storage

```javascript
OBJY.define({
	name: 'object',
	pluralName: 'objects',
	storage: OBJY.customStorage({

      createClient: function(client, success, error) { },

      getDBByMultitenancy: function(client) { },

      listClients: function(success, error) { },

      getById: function(id, success, error, app, client) { },

      getByCriteria: function(criteria, success, error, app, client, flags) { },

      count: function(criteria, success, error, app, client, flags) { },

      update: function(spooElement, success, error, app, client) {  },

      add: function(spooElement, success, error, app, client) { },

      remove: function(spooElement, success, error, app, client) { }
   })
})
```


## Processor

```javascript
OBJY.define({
	name: 'object',
	pluralName: 'objects',
	processor: OBJY.customProcessor({
      execute: function(dsl, obj, prop, data, callback, client, app, user, options) { }
   })
})
```


## Observer

```javascript
OBJY.define({
	name: 'object',
	pluralName: 'objects',
	observer: customObserver({
      initialize: function(millis) { },

      run: function(date) {  }
   })
})
```

# Mappers

## MongoDB Storage Mapper

A mapper for using mongodb as storage backend for your objects

***Installing***

```
npm install objy-mapper-mongodb
```

***Usage***

```javascript
const MongoMapper = require('objy-mapper-mongodb');

// Define an object family
OBJY.define({
   name : "Object",
   pluralName: "Objects",
   storage: new MongoMapper().connect('mongodb://localhost'),
})

// Use the object family's constructor
OBJY.Object({name: "Hello World"}).add(function(data){
   console.log(data);
})
```

## GridFS Storage Mapper

A mapper for using gridfs as storage backend for your file objects.

> This is especially for storing objects as files

***Installing***

```
npm install objy-mapper-gridfs
```

***Usage***

```javascript
const GridFSMapper = require('objy-mapper-gridfs');

// Define an object family
OBJY.define({
   name : "Object",
   pluralName: "Objects",
   storage: new GridFSMapper().connect('mongodb://localhost'),
})

// Use the object family's constructor
OBJY.Object({name: "Hello World"}).add(function(data){
   console.log(data);
})
```

## OBJY Platform Connect


***Install***

```
npm install objy-connect
```

or on the Browser

```html
<script src="https://cdn.jsdelivr.net/npm/objy/dist/browser.js"></script>
<script src="https://cdn.jsdelivr.net/npm/objy-connect/index.js"></script>
```

***Usage***

```javascript
/*
   On Node, you need to require these:
   let OBJY = require('objy');
   let CONNECT = require('objy-connect');

   On the Browser, the CONNECT object is available automatically
*/

let remote = new CONNECT(OBJY)
remote.connect({client: "myclient", url: "https://mydomain.com/api"});

OBJY.define({
  name: "object",
  pluralName: "objects",
  storage: remote
})

// Use the object family's constructor
OBJY.object({name: "Hello World"}).add(function(data) {
   console.log(data);
})
```

