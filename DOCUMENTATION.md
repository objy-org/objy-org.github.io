<h1><i>Powerful JavaScript Objects</i></h1>
OBJY brings JS objects to life by adding features, like <b>inheritance, automated actions, permissions, custom storage</b> and more. This makes it super easy to digitalize real-life use cases.


<img src="/assets/img/OBJY-object-code.png" data-origin="assets/img/OBJY-object-code.png" alt="OBJY LOGO" title="OBJY" style="
    margin-bottom: 5%;
    margin-top: 5%;
">


# Quickstart Example

```javascript
// Define an object family called "item" and "items" for plural
OBJY.define({ name: "item", pluralName: "items" })

// Use the newly created "item" to create an object
OBJY.item({
	name: "Credit Card",
	number: {
		type: "number",
		value: "123456789"
	}
	onCreate: {
		myCustomLog: {
			action: () => { console.log('Credit Card created') }
		}
	}
}).add(o => {})
````

# 1. Installing


```shell
npm install objy
```
<!--
***Browser***

```html
<script src="https://cdn.jsdelivr.net/npm/objy/dist/browser.js">
```
-->


# 2. Define Objects

Objects can be defined with object families. These are "buckets" of objects, that share a common nature, like storage for example. 

```javascript
OBJY.define({
	// Minimal config:
	name: "item",
	pluralName: "items",

	// More custom options:
	...
})
````

# 3. Use Objects

> All object operations can be used with either callbacks or async/await

```javascript
// Callback
OBJY.object({}).add(data => {})

// async/await
let myObject = await OBJY.object({}).add()
```

## CRUD

> Add

```javascript
// add one
OBJY.object({name:"card"}).add(o => {

})

// add multiple
OBJY.objects([{name:"card"}],[{name:"token"}]).add(objs => {

})
```

> Get one
```javascript
OBJY.object("id").get(o => {})
```

> Query

```javascript
let objs = await OBJY.object({type:'example', 'expired' : false).get()
// [{},{}]
```

> Update

```javascript
OBJY.object("id").get(o => {
	o.setPropertyValue('expired', false).addProperty('open', false).save()
})
```

> Remove

```javascript
OBJY.object("id").get(o => {
	o.remove()
})
```


## Properties

Each object can have custom, dynamic properties, that bring an object to life. Properties can be a simple key-value nature or typed.

### Simple Properties

```javascript
{
	name: "Creditcard",
	number: "123"
}

```

### Typed Properties

Or they can be typed. Typed properties will automatically be type-checked by OBJ. Properties can have any of the following types

* `shortText` a string with up to 255 chars
* `longText` a string with up more than 255 chars
* `number` a number (decimal or non-decimal)
* `boolean` a boolean value (true or false)
* `date` an ISO8601 date string
* `action` an action that can be triggered
* `event` a time-based event that is observed in the background
* `bag` nested properties


```javascript
{
	shortDescription: {
		type: "shortText,
		value: "This is a text"
	},
	longDescription: {
		type: "longText,
		value: "This is a longer text..."
	},
	age: {
		type: "number,
		value: 5
	},
	really: {
		type: "boolean,
		value: true
	},
	really: {
		type: "action,
		value: "some action"
	},
	really: {
		type: "date,
		value: "2020-02-02" // ISO8601 String
	},
	onThisDate: {
		type: "date,
		date: "2020-02-02"
		action: "some action..." // will be triggered when the date is reached
	},
	everyMinute: {
		type: "date,
		interval: 60000
		action: "some action..." // will be triggered every time the interval repeats
	},
	address: {
		type: "bag,
		properties: {
			street: {
				type: "shortText",
				value: "main street"
			},
			city: {
				type: "shortText",
				value: "main city"
			}

		}
	}
}
```

### Methods

```javascript
OBJY.object({}).setProperty("123", {
   type: "number",
   value: 1.8
})

OBJY.object({}).setProperty("123", 1.8)

OBJY.object({}).addProperty("123", {
   type: "number",
   value: 2.5
})

OBJY.object({}).addProperty("myBag.subProp", {
   type: "number",
   value: 2.5
})

OBJY.object({}).setPropertyValue("123", 1.8)

OBJY.object({}).removeProperty("123", 1.8)
```

## Inheritance

Objects can inherit attributes from other objects. This is useful for creating templates or reusing patterns.
Each object has the `inherits` attribute, in which the id's of the objects to inherits from are defined.

```javascript
// This is used as a template
OBJY.object({
	_id: "321",
	name: "carTemplate", 
	properties: {
		color: {
			type: "shortText",
			value: "red"
		}
	}
})

// Create an object that inherits from the template above.
// Any attribute missing here, will be added from the template
OBJY.object({
	inherits: ["321"],
	name: "car"
}).add(obj => {
	console.log(obj);
	/*
		{
			name: "car",
			properties: {
				color: {
					type: "shortText",
					value: "red",
					template: "321" // this tells you when an attribute is inherited with the template id.
				}
			}
		}
	*/
})
```

> Operations


```javascript
OBJY.object({}).addInherit("123")

OBJY.object({}).removeInherit("123")
```



## Handlers

Handlers can be used to automatically trigger an action when an object is created, changed or deleted.

```javascript
OBJY.object({
	_id: "ksgsgk",
	onCreate: {
		sayHi: {
			value: () => {
				console.log('hi')
			}
		}
	},
	onChange: {
		sayok: {
			value: () => {
				console.log('pk')
			}
		}
	},
	onDelete: {
		sayBye: {
			value: () => {
				console.log('bye')
			}
		}
	}
})
```

> Operations


```javascript
OBJY.object({}).setOnCreate("validate", {
   value: "action code...",
   trigger: "before" // defines wether the handler triggeres before or after the main operation
}})

OBJY.object({}).removeOnCreate("validate")

OBJY.object({}).setOnChange("validate", {
   value: "action code...",
   trigger: "before" // defines wether the handler triggeres before or after the main operation
}})

OBJY.object({}).removeOnChange("validate")

OBJY.object({}).setOnDelete("validate", {
   value: "action code...",
   trigger: "before" // defines wether the handler triggeres before or after the main operation
}})

OBJY.object({}).removeOnDelete("validate")
```


# Permissions


Each object can have permissions (optional) for access control. Permissions are mounted under the `permissions` attribute and are structured with the role name as key and an object with a value for permission codes: `{admin: {value: "*"}}`

```javascript
{
	name: "my object",
	permissions: {
		PRIVILEGE: {
			value: "PERMISSIONS"
		},
		
		// Example
		maintainer: {
			value: "cru"
		}
	}
}
```

> Permission codes are single-character shortcuts that stand for a certain operation type. Permission Codes can be combined, like "cr" or "crud".

Available permission codes:

* `*` Do everything
* `c` Create
* `r` Read
* `u` Update
* `d` Delete


> Operations

```javascript
/* takes the handler name  */
OBJY.object({}).setPermission("name", {value: "*"})

OBJY.object({}).removePermission("name")
```


# Affectables

Affectables are rules that can simply be applied to objects with a matching criteria.

```javascript
OBJY.affectables = [{
	_id: 123,
	affects: { // define a query (match the objects that you want to use the rules on)
		type: 'car'
	}, 
	applies: { // this part will be logically added to any object matching the criteria, when performing an operation on an object

	}
}]
```

> This feature is currently experimental


# Multitenancy

OBJY by default is multi-tenancy capable.

The objects of each tenant (or `client`) will be treated seperately.

You can set and change a client context with `OBJY.client('name')`

```javascript
OBJY.client('mycompany');
// mycompany context available from here

OBJY.client('anothercompany');
// anothercompany context available now
```

# Users

User contexts are useful when working with access control (permissions). When setting a user context, all following operations are done as that user. Permissions are applied.

```javascript
OBJY.useUser({username: "...", privileges: {...}})
```

# Applications

Each object can be assigned to applications. When an application context is set, only objects that are assigned to the application are relevant.

```javascript
{
	_id: 123,
	applications: ["appOne", "appTwo"],
	...
}
```

An application context can be set using `OBJY.app(appName)`.

> When you are in an app context, everything you do is restricted to that context. E.g. when you add an object, it will be assigned to that app or when your query for objects, you will only get results that are assigned to the current app.



```javascript
// Set the application context
OBJY.app("demo");
```



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

> MongoDB Storage Mapper for using mongodb as storage backend for your objects

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
