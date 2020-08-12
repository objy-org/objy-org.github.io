# OBJY Documentation

Official Documentation of the OBJY framework. Here you will learn about the concepts of the framework as well as how to use them.


# Prequesits

When reading this documentation, you should have installed OBJY as shown in the official [README](./README.md).


# Concepts

## Object Families

Before starting with OBJY, you'll need to define one or more Object Families. 
An Object Family is a configuration, that is valid for all single objects that are part of the particular family.

Object Families define important information, like the constructor for handling objects and the storage, processing and observation backends.


```javascript
OBY.define({
	name: "object",
	pluralName: "objects"
})

// once defined, objects in this object family can be wrapped with:
OBJY.object(...)
OBJY.objects(...)
```

## Object structure

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


# Handling Objects

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

## CRUD

When it comes to working with objects, the basic operations you need are ***CRUD*** (Create, Read, Update, Delete)

| Operation        | available for  | Explanation           | 
| ------------- |-------------| -------------| 
| `add(success, err)`      | singular + plural      | Adds one or more objects | 
| `get(success, err)`      | singular + plural     | Gets one or more objects | 
| `update(success, err)`     | singular       | Updates an object | 
| `delete(success, err)`     | singular      | Deletes an object | 


> Examples:

```javascript
// Add a single object
OBJY.object({}).add()

// Add multiple objects (array of objects)
OBJY.objects([{},{}])

// Get single object (by id)
OBJY.object("ID").get();

// Get multiple objects (using a json query)
OBJY.objects({query}).get()

// Update an object (by id)
OBJY.object("ID").get(obj => {
	obj.setName("Test").update()
})

// Delete an object (by id)
OBJY.object("ID").delete()
```



## Object operations

Each single object comes with some built-in functionalities for defining it's own nature.


> Object functions can be chained!


```javascript
OBJY.object({})
	.setName('hello')
	.setType('world')
	.update(obj => {})
```


### setName

Sets the object's name

```javascript
/* takes a name as String*/
OBJY.object({}).setName("test")
```

### setType

Sets the object's type

```javascript
/* takes a type as String*/
OBJY.object({}).setType("test")
```

### addApplication

Adds an application that this object is available in

```javascript
/* takes an app identifier as String*/
OBJY.object({}).addApplication("demo")
```

### removeApplication

Removes an assigned application

```javascript
/* takes an app identifier as String*/
OBJY.object({}).removeApplication("demo")
```

### addInherit

Adds another object to inherit from

```javascript
/* takes an object id as String*/
OBJY.object({}).addInherit("123")
```

### removeInherit

Removes an inherit-relationship

```javascript
/* takes an object id as String*/
OBJY.object({}).removeInherit("123")
```

### addProperty


```javascript
/* takes a name as string and content as Object*/
OBJY.object({}). addProperty("123")
```


...



## Dynamic Properties

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
* `longText`a string with up more than 255 chars
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

## Application Context

> This is an optional feature

Each object can be assigned to one or more applications, by defining the `applications` attribute.

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

// When an object is created, the demo app will automatically be added to its list of assigned applications
OBJY.object({}).add(obj => {
	console.log(oby); // {_id: 123, applications: ["demo"], ...}
})
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

## User Context and Permissions

> This is optional!

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



On the other side, objects can be used as users that can access other objects. To make certain objects authable, set the `authable` flag wehen defining the object family:

```javascript
OBJY.define({
	name: "user",
	pluralName: "users",
	authable: true
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


## Mappers