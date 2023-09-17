# MongoDB Storage Mapper

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

# GridFS Storage Mapper

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

# OBJY Platform Connect


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
