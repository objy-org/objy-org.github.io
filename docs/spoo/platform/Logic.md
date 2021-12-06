# OBJY

## Dynamic objects

> SPOO uses OBJY for it's abstract, object-driven programming model. Specific endpoints are mapped to predefined object methods, like add, update, query, get and remove. Logic can be implemented using these objects. Learn more about OBJY here...


```javascript
SPOO.define({

  // needed params:
  name: "template", // the singular name for single object access
  pluralName: "templates", // the plural name for access to multiple objects

  // optional params:
  authable: false, // Sets wether objects of an object family can authenticate (login) against the platform
  templateFamily: "templates", // Defines, where inherited objects are retrieved from. Defaults to object family itself.

  // overwrite mappers (default mappers are all in memory):
  storage: new mongo("..."),
  processor: new vm(""),
  observer: new interval() 
})

````

## Custom Mappers

Every Object Wrapper can have custom plugged-in technologies for `persistence`, `processing` and `observing`


```javascript
SPOO.define({
  storage: new mongo("..."),
  processor: new vm(""),
  observer: new interval() 
})
````