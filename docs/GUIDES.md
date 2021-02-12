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

OBJY.item({name: "my first item"}).add(obj => {
   console.log(obj)
   /*
   	{
   	   name: "my first item"
   	}
   */
}, err => {
   console.error(err);
})
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
   
   OBJY.item({name: "my first item"}).add(obj => {
      console.log(obj)
      /*
      	{
      	   name: "my first item"
      	}
      */
   }, err => {
      console.error(err);
   })
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

OBJY.objects({}).get(objects => {})
```

## Handling objects with CRUD

Objects are handled with crud operations (create, read, update, delete).

The following operations are available and can be used with any object wrapper:

```javascript
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

```javascript
// Add an object
OBJY.item({name: "my first item"}).add(obj => {

   // update it:
   obj.addProperty('color', 'blue');
   obj.update();

}, err => {
   console.error(err);
})
```