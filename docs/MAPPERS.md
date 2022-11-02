# Mappers

OBJY comes with a number of additions.

## MongoDB Storage Mapper

A mapper for using mongodb as storage backend for your objects

***Installing***

```
npm install objy-mapper-mongodb
```

***Usage***

```
const MongoMapper = require('objy-mapper-mongodb');

// Define an object family
OBJY.define({
   name : "Object",
   pluralName: "Objects",
   storage: new MongoMapper().connect('mongodb://localhost'),
})

// Use the object family's constructor
OBJY.Object({name: "Hello World"}).add(function(data)
{
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

```
const GridFSMapper = require('objy-mapper-gridfs');

// Define an object family
OBJY.define({
   name : "Object",
   pluralName: "Objects",
   storage: new GridFSMapper().connect('mongodb://localhost'),
})

// Use the object family's constructor
OBJY.Object({name: "Hello World"}).add(function(data)
{
   console.log(data);
})
```
