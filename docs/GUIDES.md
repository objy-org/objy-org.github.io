# OBJY Guides

Here, you'll find some hands-on examples and best practices on how to use objy.

# Setup Examples

Get startet with OBJY.

## Get started in Node

```javascript
const OBJY = require('objy');

OBJY.define({
   name: "item",
   pluralName: "items"  
});

var myObj = OBJY.item({name: "my first item"})

console.log(myObj)
   /*
   	{
   	   name: "my first item"
   	}
   */
```

## Get started in the Browser

```html
<html>
<head>
   <script src="https://cdn.jsdelivr.net/npm/objy/dist/browser.js"></script>
</head>
<body>
<script>
   OBJY.define({
      name: "item",
      pluralName: "items"  
   });
   
   var myObj = OBJY.item({name: "my first item"})

   console.log(myObj)
      /*
         {
            name: "my first item"
         }
      */
</script>
</body>
</html>
```

# Basics

## Define object wrappers

In order to use objects, you'll need to define object wrappers. These wrappers are used to handle individual objects.

```javascript
const OBJY = require('objy');

// Step 1: Define your wrappers

OBJY.define({
   name: "object",
   pluralName: "objects"  
});

OBJY.define({
   name: "item",
   pluralName: "items"  
});

// Step 2: Use your wrappers to handle objects

OBJY.item({...});

OBJY.items([{...}, {...}]);

OBJY.objects({}).get(objects => {})
```

## Persistence

Objects can be persisted using custom or predefined persistence mappers. When working with persistence, the built-in CRUD operations musst be used to commit changes to the persistence.

The following operations are available and can be used with any object wrapper:

```javascript
// Define your wrapper and set persistence
OBJY.define({
   name: 'item',
   pluralName: 'items',
   storage: new OBJY_CATALOG.mappers.storage.mongoDB('mongodb://locahlost')
})

// Add an object
OBJY.item({}).add();

// Add multiple objects
OBJY.items([{},{}]).add()

// Query multiple objects
OBJY.items({}).get()

// Get one object by it's _id
OBJY.item("id").get()

// Update one object
OBJY.item({}).addProperty(name, value).update()

// Delete one object by it's _id
OBJY.item("id").remove()
```