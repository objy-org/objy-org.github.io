# SPOO Platform Docs

SPOO - Single Point of Object.

## Install

A SPOO Platform runs on Node.js.

```javascript
npm i spoojs
```

> For running a platform your will also need Redis and MongoDB

# Example Setup

Setting up a platform is fairly simple. Here is a simple example for a platform with:

* Two Object Families
* Standard REST Interface


```javascript
// import spoo
const OBJY = require('spoojs');

// define some "object families"
OBJY.define({
  name: "user",
  pluralName: "users",
  authable: true
})

OBJY.define({
  name: "object",
  pluralName: "objects"
})

// run the platform via REST
OBJY.REST({
  port:80,
  OBJY,
  metaMapper: new SPOO.metaMappers.mongoMapper().connect("mongodb://localhost")
}).run()
```

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


# API

## REST Interface

The REST Interface is the default interface in SPOO. It spins up an express server, that has all the required SPOO routes ready.

```javascript
SPOO.REST({
  port: 80, // The port to run on
  redisCon: "localhost", // The redis connection (for session storage)
})
````

This will splin up the API at `/api`:

```curl
HOST/api
```

## Options

...

## Endpoints

..


# Workspaces

For ***multitenancy***, any SPOO Platform can have multiple workspaces. Each workspace is an isolated space for each tenant.

The workspace registration feature is enabled by default, but can be changed with:

```javascript
SPOO.allowClientRegistrations = true | false
```

## Create a workspace

Creating a workspace is done in two steps:

1. Get a registration key via email
```curl
POST HOST/api/client/register {email: "YOUR EMAIL"}
```

2. Register a workspace with tat key
```curl
POST HOST/api/client {registrationKey: "KEY", clientname: "YOUR WORKSPACE NAME"}
```


# User accounts

User accounts are defined using an object wrapper with the `authable` flag set to `true`

```javascript
SPOO.define({
   name: "user",
   pluralName: "users",
   authable: true
})
```

## Register a user

This feature is enabled by default and can be changed with:

```javascript
SPOO.allowUserRegistrations = true | false
```
TO BE DOCUMENTED... (coming soon)


# Metadata

The Meta Mapper is a mapper to a MongoDB instance, that holds some basic information for the platform itself. It is used for things like storing workspace information or temporary registrations keys.


```javascript
SPOO.REST({
  ...
  metaMapper: new SPOO.metaMappers.mongoMapper().connect("mongodb://localhost"),
  ...
}).run()
````

# Messaging system

...
