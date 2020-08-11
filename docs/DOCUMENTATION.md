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
```

## Dynamic Properties

## Inheritance

## Application Context

## User Context



# Handling Objects

Each Object Family introduces two constructors that are used as a wrappers for objects that are part of the family: a singular and a plural constructor.

* ***singular constructors*** are for handling single objects
* ***plural constructors*** are for handling multiple objects

```javascript
//single constructor
OBJY.object(...)

// plural constructor
OBJY.objects(...)
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

...


## Mappers