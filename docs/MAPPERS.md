# OBJY Catalog

[Github](https://github.com/objy-org/objy-catalog)

A collection of adapters for using the right technologies for specific use cases and building domain specific object families. 

## Getting Started

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


## Example

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