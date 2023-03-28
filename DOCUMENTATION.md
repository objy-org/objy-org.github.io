# OBJY - Abstract, powerful JavaScript objects

An object-driven programming framework, that uses behaviour-driven objects for building use cases. 


![OBJY LOGO](https://objy.xyz/assets/img/objy-arch-objects-slim.png "OBJY")

OBJY Objects:

* are plain JavaScript objects
* have dynamic origins
* have behaviour
* and more...


## Quick example

Programming on OBJY is done in two simple steps:

1. Define an object family (a bucket of objects)
2. Build and handle objects and tell them what to do.


```javascript
// 1. Define Object Family
OBJY.define({
   name: "object", // singular constructor name
   pluralName: "objects" // plural constructor name
})

// 2. Use objects
var myObj = OBJY.object({
   expired: false,
   expiration_date: {
      date: "12/31/2022",
      action: () => {
         obj.setProperty('expired', true).update();
      }
   },
   maintenance: {
      interval: "1PY",
      action: () => {
         console.log('annually maintenence');
      }
   }
}).add();

// Update an object (onChange handlers will trigger)
myObj.name = "Hello World";

// or use the built-in methods:
myObj.addProperty('color', 'blue');

// Delete an object (onDelete handlers will trigger)
myObj.remove();
```


## Date or interval-based events:

Events can either have a date or an interval. OBJY takes care of running the associated action.

```javascript
OBJY.object({
   ...
   expiration_date: {
      date: "12/31/2022",
      action: () => {
         obj.setProperty('expired', true).update();
      }
   },
   maintenance: {
      interval: "1PY",
      action: () => {
         console.log('annually maintenence');
      }
   }
})
```

## Handlers

Use onCreate, onChange or onDelete to capture these events and OBJY runs a custom action.

```javascript
OBJY.object({
   ...
   onDelete: {
      quit: {
         action: () => {
            console.log('Im now gone...')
         }}
   }
})
```

## Inheritance

```javascript
// first object
OBJY.object({
   _id: 123,
   type: "yogurt"
})
// second object that inherits from first object
// inherit from one or more other objects using their id
OBJY.object({
   ... 
   inherits: [123], 
   // type: "yogurt" and all other props are present here
})
``` 


## Custom Mappers

```javascript
OBJY.define({
   ...
   // Attach your own storage (can be anything that supports crud)
   storage: OBJY.customStorage({
      add: () => {},
      getById: () => {},
      ...
   }),
   // Customize, how actions are executed
   processor: OBJY.customProcessor({
      execute: (action) => {}, 
      ...
   }),
   // Observe events yourself
   observer: OBJY.customObserver({
      run: () => {}
   })
})
```

# Installing

***Node***

```shell
npm install objy
```

***Browser***

```html
<script src="https://cdn.jsdelivr.net/npm/objy/dist/browser.js">
```

# Object Families

Object families are groups of objects, that have the same origin.

## In-Memory

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

# Object structure

Every object, despite what object family it belongs to, is represented as JS object. It can have any structure.

```javascript
OBJY.object({
	_id: "", // always there
	key: value
})
```

Each Object Family introduces two constructors that are used as a familys for objects that are part of the family: a singular and a plural constructor.

* ***singular constructors*** are for handling single objects
* ***plural constructors*** are for handling multiple objects

```javascript
//single constructor
OBJY.object({
	name: "hello world"
})

// plural constructor
OBJY.objects([
	{
		name: "obj one"
	},
	{
		name: "obj two"
	}
])
```



## Properties

Each object can have custom, dynamic properties, that bring an object to life. 

```javascript
{
	_id: "123",
	name: "test",
	type: "test",
	age: {
		type: "number",
		value: 5
	}
}
```

Properties can have any of the following types:

* `shortText` a string with up to 255 chars
* `longText` a string with up more than 255 chars
* `number` a number (decimal or non-decimal)
* `boolean` a boolean value (true or false)
* `date` an ISO8601 date string
* `action` an action that can be triggered
* `event` a time-based event that is observed in the background
* `bag` nested properties

### shortText

```javascript
{
	shortDescription: {
		type: "shortText,
		value: "This is a text"
	}
}
```

### longText

```javascript
{
	longDescription: {
		type: "longText,
		value: "This is a longer text..."
	}
}
```

### number

```javascript
{
	age: {
		type: "number,
		value: 5
	}
}
```

### boolean

```javascript
{
	really: {
		type: "boolean,
		value: true
	}
}
```

### action

```javascript
{
	really: {
		type: "action,
		value: "some action"
	}
}
```


### date

```javascript
{
	really: {
		type: "date,
		value: "2020-02-02" // ISO8601 String
	}
}
```

### event

Date properties can either have a strict `date` or an `interval`

```javascript
{
	onThisDate: {
		type: "date,
		date: "2020-02-02"
		action: "some action..." // will be triggered when the date is reached
	},
	everyMinute: {
		type: "date,
		interval: 60000
		action: "some action..." // will be triggered every time the interval repeats
	}
}
```

### bag

Bags are nested properties and can even contain other bags. Instead of the value attrubte, they have `properties`

```javascript
{
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

### Operations

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


## Application

Each object can be assigned to applications. When an application context is set, only objects that are assigned to the application are relevant.

```javascript
{
	_id: 123,
	applications: ["appOne", "appTwo"],
	...
}
```

### Operations

```javascript
OBJY.object({}).addApplication("demo")

OBJY.object({}).removeApplication("demo")
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

### Operations


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

### Operations


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



## Permissions

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


### Operations

```javascript
/* takes the handler name  */
OBJY.object({}).setPermission("name", {value: "*"})

OBJY.object({}).removePermission("name")
```


## Authable objects (e.g. users)

On the other side of a permission, objects can be used as users that can access other objects. To make certain objects authable, set the `authable` flag wehen defining the object family:

```javascript
OBJY.define({
	name: "user",
	pluralName: "users",
	authable: true // Set this to true
})

// objects from families with the authable flag = true have the following additional attributes:
{
	...
	username: "peter",
	password: "***",
	email: "peter@whatever.org",
	privileges: { // Here are the user roles defined
		demo: [ // Permissions are app-specific
			{
				name: "admin"
			}
		]
	} 
}
```


### Operations

```javascript
OBJY.object({}).setUsername("peter")

OBJY.object({}).setEmail("peter@griffin.com")

// Privileges can only be used when working in an app context

OBJY.useApp("demo"):

OBJY.object({}).addPrivilege("admin")

/*
 {
 	...
 	privileges: {
 		demo: [{name: admin}]
 	}
 }
 */

OBJY.useApp("demo");

OBJY.object({}).removePrivilege("admin")
```

> ***Privileges are app-based!*** An authable object can have different privileges for different apps. If you add a privilege in an app context, OBJY will put in in the right place:


# Handling objects

## Add

```javascript
// add one
OBJY.object({}).add()

// add multiple
OBJY.objects([{}],[{}]).add()
```

## Get one
```javascript
// by its reference:
let myObj = OBJY.object({...});
console.log(myObj);

// or via the get method
OBJY.object(id).get(obj => {
	console.log(obj)
});
```

## Query

```javascript
OBJY.objects({type:'example', 'expired' : false}).get(objs => {

});
```

## Update

```javascript
// update via api methods
OBJY.object({})
   .setPropertyValue('expired', false)
   .addProperty('open', false)

// update directly
var obj = OBJY.object({});

obj.name = 'Hello'
```

## Delete

```javascript
// delete one
OBJY.object({}).delete(obj => {});
```


# Contexts

## Application Context

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


## Client Context

OBJY by default is multi-tenancy capable.

The objects of each tenant (or `client`) will be treated seperately.

You can set and change a client context with `OBJY.client('name')`

```javascript
OBJY.client('mycompany');
// mycompany context available from here

OBJY.client('anothercompany');
// anothercompany context available now
```

## User Context

User contexts are useful when working with access control (permissions). When setting a user context, all following operations are done as that user. Permissions are applied.

```javascript
OBJY.useUser({username: "...", privileges: {...}})
```

# Functional Programming

At some point, you'll need to implement custom functionalities. Functionalities, like custom code (js functions), are invoked within ***handlers*** (see chapter below).

Example 1: Custom js function

```javascript
/* log something on object creation */
OBJY.object({
	onCreate: {
		doSomething: {
			action: () => {
				console.log('custom function called')
			}
		}
	}
})
```

Example 2: Code as string

```javascript
/* log something on object creation */
OBJY.object({
	onCreate: {
		doSomething: {
			action: `
				console.log('custom function called')
			`
		}
	}
})
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

# Featured Mappers

## MongoDB


## SPOO (OBJY Server)

SPOO is a project for exposing any OBJY environment as a RESTful platform.

> For running a basic platform you will need ***Node.js***, ***Redis*** and ***MongoDB***. This will change in the future. The following quick examples show you how to spin up a platform and a client with just a few lines of code.


***Server***

```shell
npm i objy spoojs
```

```javascript
const OBJY = require('objy');
const SPOO = require('spoojs');

OBJY.define({
  name: "user",
  pluralName: "users",
  authable: true
})

OBJY.define({
  name: "object",
  pluralName: "objects"
})

SPOO.REST({
  OBJY,
}).run()
```

## OBJY Connect

Connect to a SPOO instance

```html
<script src="https://cdn.jsdelivr.net/npm/objy-connect/index.js">
```
or
```shell
npm i objy-connect
```

```javascript
let remote = new CONNECT(OBJY)

OBJY.define({
  name: "object",
  pluralName: "objects",
  storage: remote
})

// Login
remote.connect({client: "myclient", url: "https://mydomain.com/api", username: "user", password: "***"}, () => {
  OBJY.objects({}).get(data => {
    console.log('data:', data)
  }, err => {
    console.log('err:', err)
  })
})
```