# OBJY Documentation

Official Documentation of the OBJY framework. Here you will learn about the concepts of the framework as well as how to use them.

# Prequesits

When reading this documentation, you should have installed OBJY as shown in the official [README](./README.md).

# Object Wrappers

Before starting with OBJY, you'll need to define one or more Object Wrappers. 
An Object Wrapper is a configuration, that is valid for all single objects that are part of the particular wrapper.

Object Wrappers define important information, like the constructor for handling objects and the storage, processing and observation backends.


```javascript
OBY.define({
	name: "object",
	pluralName: "objects"
})

// once defined, objects in this object wrapper can be wrapped with:

OBJY.object(...)
OBJY.objects(...)
```


# Object structure

Every object, despite what object family it belongs to, is represented as JS object and has a basic structure

```javascript
{
	/* Basic structure (always present) */
	_id: "", // a unique id
	name: "", // an object name
	type: "", // a custom type
	applications: [], // a list of apps that this object is available in
	inherits: [], // a list of other object's ids that this object inherits from
	properties: {}, // an object that holds all your custom properties
	
	/* Additions (only available when filled) */
	permissions: {}, // permissions for access control
	onCreate: {}, // an object for different action handlers
	onchange: {}, // an object for different action handlers
	onDelete: {}, // an object for different action handlers
}
```


Each Object Family introduces two constructors that are used as a wrappers for objects that are part of the family: a singular and a plural constructor.

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



# CRUD

When it comes to working with objects, the basic operations you need are ***CRUD*** (Create, Read, Update, Delete)

| Operation        | available for  | Explanation           | 
| ------------- |-------------| -------------| 
| `add(success, err)`      | singular + plural      | Adds one or more objects | 
| `get(success, err)`      | singular + plural     | Gets one or more objects | 
| `update(success, err)`     | singular       | Updates an object | 
| `delete(success, err)`     | singular      | Deletes an object | 


## Add

```javascript
// add one
OBJY.object({}).add(callback);

// add multiple
OBJY.objects([{}],[{}]).add(callback);
```

## Get one
```javascript
OBJY.object(id).get(callback);
```

## Query

```javascript
OBJY.objects({type:'example', 'properties.expired' : false}).get(callback);
```

## Update

```javascript
// update one
OBJY.object(id)
   .setPropertyValue('expired', false)
   .addProperty('open', false).
   .save(callback)

// replace one
OBJY.Object(id).replace(newObject).save(callback);
```

## Delete

```javascript
// delete one
OBJY.object(id).delete(callback);
```


# Basic information

Every object has some basic attributes that are always present:

```javascript
{
   ...
   name: null,
   type: null
}
```

## setName

Sets the object's name

```javascript
/* takes a name as string*/
OBJY.object({}).setName("test")
```

## setType

Sets the object's type

```javascript
/* takes a type as string*/
OBJY.object({}).setType("test")
```

# Application Contexts

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


## addApplication

Adds an application that this object is available in

```javascript
/* takes an app identifier as string*/
OBJY.object({}).addApplication("demo")
```

## removeApplication

Removes an assigned application

```javascript
/* takes an app identifier as string*/
OBJY.object({}).removeApplication("demo")
```

# Inheritance

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

## addInherit

Adds another object to inherit from

```javascript
/* takes an object id as string*/
OBJY.object({}).addInherit("123")
```

## removeInherit

Removes an inherit-relationship

```javascript
/* takes an object id as string*/
OBJY.object({}).removeInherit("123")
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


# Dynamic Properties

Each object can have custom, dynamic properties, that bring an object to life. They are mounted to the `properties` attribute on an object and are structured with the name as key and an object containing the property type and value: `{propName: {type: "", value: ""}}`.

```javascript
{
	_id: "123",
	name: "test",
	type: "test",
	properties: {
		// your properties will be here!
		age: {
			type: "number",
			value: 5
		}
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

## shortText

```javascript
{
	shortDescription: {
		type: "shortText,
		value: "This is a text"
	}
}
```

## longText

```javascript
{
	longDescription: {
		type: "longText,
		value: "This is a longer text..."
	}
}
```

## number

```javascript
{
	age: {
		type: "number,
		value: 5
	}
}
```

## boolean

```javascript
{
	really: {
		type: "boolean,
		value: true
	}
}
```

## action

```javascript
{
	really: {
		type: "action,
		value: "some action"
	}
}
```


## date

```javascript
{
	really: {
		type: "date,
		value: "2020-02-02" // ISO8601 String
	}
}
```

## event

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

## bag

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

## setProperty

Replaces the content of a property

```javascript
/* takes the property name and new content*/
OBJY.object({}).setProperty("123", {
   type: "number",
   value: 1.8
})

// If you are working with literals as value

OBJY.object({}).setProperty("123", 1.8)
```

## addProperty

Adds a compley property to an object

> Properties are key/value pairs, stored in an object under `properties`. The value can either be a simple literal (like above) or an object containing a type and value.
> The second variant is way more powerful, because you will have type checking, you can add property-permissions, handlers and more.

```javascript
/* takes a name as string and content as object*/

OBJY.object({}).addProperty("123", {
   type: "number",
   value: 2.5
})
```

> If you are adding a sub property to a bag, access is done using `dot notation`:

```javascript
OBJY.object({}).addProperty("myBag.subProp", {
   type: "number",
   value: 2.5
})
```


---

Add a simple property to an object (without type definition)

```javascript
/* takes a name as string and content as literal*/

OBJY.object({}).addProperty("123", 2.5)
```

> If you are adding a sub property to a bag, access is done using `dot notation`:

```javascript
OBJY.object({}).addProperty("myBag.subProp", 2.5)
```


## setPropertyValue

Changes the value of a property. 

```javascript
/* takes the property name and new value*/
OBJY.object({}).setPropertyValue("123", 1.8)
```


## removeProperty

Removes a property from an object

```javascript
/* takes the property name  */
OBJY.object({}).removeProperty("123", 1.8)
```


# Client Context

OBJY by default is multi-tenancy capable.

The objects of each tenant (or `client`) will be treated seperately.

You can set and change a client context with `OBJY.client('name')`

```javascript
OBJY.client('mycompany');
// mycompany context available from here
// ...

OBJY.client('anothercompany');
// anothercompany context available now
// ...
```


# Handlers

Handlers can be used to automatically trigger an action when an object is created, changed or deleted.

## setOnCreate

Adds/Sets an onCreate handler

```javascript
/* takes the handler name and content as object */
OBJY.object({}).setOnCreate("validate", {
   value: "action code...",
   trigger: "before" // defines wether the handler triggeres before or after the main operation
}})
```

## removeOnCreate

Removes an onCreate handler

```javascript
/* takes the handler name  */
OBJY.object({}).removeOnCreate("validate")
```

## setOnChange

Adds/Sets an on change handler

```javascript
/* takes the handler name and content as object */
OBJY.object({}).setOnChange("validate", {
   value: "action code...",
   trigger: "before" // defines wether the handler triggeres before or after the main operation
}})
```

## removeOnChange

Removes an on change handler

```javascript
/* takes the handler name  */
OBJY.object({}).removeOnChange("validate")
```

## setOnDelete

Adds/Sets an onDelete handler

```javascript
/* takes the handler name and content as object */
OBJY.object({}).setOnDelete("validate", {
   value: "action code...",
   trigger: "before" // defines wether the handler triggeres before or after the main operation
}})
```

## removeOnDelete

Removes an onDelete handler

```javascript
/* takes the handler name  */
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


## setPermission

Sets a permission

```javascript
/* takes the handler name  */
OBJY.object({}).setPermission("name", {value: "*"})
```

## removePermission

Removes a permission

```javascript
/* takes the handler name  */
OBJY.object({}).removePermission("name")
```


# Authable objects (e.g. users)

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


## setUsername

Sets the username. The username will be used for authentication

```javascript
/* takes a username as string*/
OBJY.object({}).setUsername("peter")
```


## setEmail

Sets the email. The email will be used for authentication

```javascript
/* takes an email as string*/
OBJY.object({}).setEmail("peter@griffin.com")
```

## addPrivilege

> Can only be used when working in an app context

Adds a privilege (role name).

```javascript
/* takes a privilege name as string*/
OBJY.object({}).addPrivilege("admin")
```

> ***Privileges are app-based!*** An authable object can have different privileges for different apps. If you add a privilege in an app context, OBJY will put in in the right place:

```javascript
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
```

## removePrivilege

> Can only be used when working in an app context

Removes a privilege (role name).

```javascript
OBJY.useApp("demo");

/* takes a privilege name as string*/
OBJY.object({}).removePrivilege("admin")
```


# Mappers

Mappers can be used do define where objects inside a particular wrapper are persisted, processed and observed.


```javascript
OBJY.define({
	name: "object",
	pluralName: "objects"
	
	// mappers
	storage: {}, // defaults to "in memory"
	processor: {}, // defaults to "eval"
	observer: {} // defaults to "interval",
})
```

> Default mappers are already initialized! If you'd like to work in memory, just ignore the mappers section

> Mapper types

| Type        | Explanation  | 
| ------------- |-------------| 
| `storage`     | Storage mappers can be plugged in to define where and how objects in an object family are persistent. | 
| `processor`   | Processor Mappers define, how object actions are executed. | 
| `observer`    | Observer Mappers define, how object events are observed and time-based actions triggered. | 


## Use existing mappers

There is a project called [objy-catalog](https://github.com/objy-org/objy-catalog), which is an open source collection of existing (and proven) mappers.

Just install the npm module and use it:

```shell
npm i objy-catalog
```

```javascript
var OBJY = require('objy');
var OBJY_CATALOG = require('objy-catalog');

OBJY.define({
	name: "object",
	pluralName: "objects",
	storage: OBJY_CATALOG.mappers.storage.mongo(),
	processor: OBJY_CATALOG.mappers.processors.vm(),
	observer: OBJY_CATALOG.mappers.observers.interval()
})

```

## Develop custom mappers

OBJY comes with a mapper api that allows you to create your own mappers for different third-party systems, like databases, file systems, processing frameworks, ...

## Storage

```javascript
// Define it
var MyMapper = function(OBJY, options) {
   return Object.assign(new OBJY.StorageTemplate(OBJY, options), {

      createClient: function(client, success, error) {

      },

      getDBByMultitenancy: function(client) {

      },

      listClients: function(success, error) {
         
      },

      getById: function(id, success, error, app, client) {

      },

      getByCriteria: function(criteria, success, error, app, client, flags) {

      },

      count: function(criteria, success, error, app, client, flags) {

      },

      update: function(spooElement, success, error, app, client) {

      },

      add: function(spooElement, success, error, app, client) {

      },

      remove: function(spooElement, success, error, app, client) {

      }
   })
}

// Use it
OBJY.define({
	...
	storage: MyMapper()
})
```


## Processor

```javascript
// Define it
var MyMapper = function(OBJY) {
   return Object.assign(new OBJY.ProcessorTemplate(OBJY), {
      
      execute: function(dsl, obj, prop, data, callback, client, app, user, options) {

      }
   })
}

// Use it
OBJY.define({
	...
	processor: MyMapper()
})
```


## observer

```javascript
// Define it
var MyMapper = function(OBJY) {
   return Object.assign(new OBJY.ObserverTemplate(OBJY), {
      initialize: function(millis) {
         
      },

      run: function(date) {

      }
   })
}

// Use it
OBJY.define({
	...
	observer: MyMapper()
})
```



