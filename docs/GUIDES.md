# OBJY Guides

...

# Setup Examples

Some examples that will help you getting started with OBJY easily

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
