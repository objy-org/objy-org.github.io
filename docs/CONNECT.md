# Connect OBJY instances running in different places. Server or Browser.

<img src="/docs/./shuttlecarrier.png" data-origin="shuttlecarrier.png" alt="sg" style="
    width: 200px;
">


OBJY Connect is a project for connecting OBJY instances. It consists of two parts:

* Server: OBJY Connect
* Client: OBJY Connect Mapper

> For running a basic platform you will need ***Node.js***, ***Redis*** and ***MongoDB***. This will change in the future. The following quick examples show you how to spin up a platform and a client with just a few lines of code.

# Client

> Install via npm or script tag:

```html
<script src="https://cdn.jsdelivr.net/npm/objy-connect-mapper/index.js">
```
or
```shell
npm i objy-connect-mapper
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

# Server


```shell
npm i objy objy-connect
```

```javascript
// 1. import connect and objy
const CONNECT = require('objy-connect');
const OBJY = require('objy');

// 2. define some "object wrappers"
OBJY.define({
  name: "user",
  pluralName: "users",
  authable: true
})

OBJY.define({
  name: "object",
  pluralName: "objects"
})

// 3. run the platform via REST
CONNECT.REST({
  port:80,
  OBJY,
  metaMapper: new CONNECT.metaMappers.mongoMapper().connect("mongodb://localhost") // The matamapper is for basic config
}).run()
```

## REST Interface

The REST Interface is the default interface in CONNECT. It spins up an express server, that has all the required CONNECT routes ready.

```javascript
CONNECT.REST({
  port: 80, // The port to run on
  redisCon: "localhost", // The redis connection (for session storage)
}).run()
````

This will splin up the API at `/api`:

```curl
HOST/api
```

## Options

...

## Endpoints

..


## Workspaces

For ***multitenancy***, any SPOO Platform can have multiple workspaces. Each workspace is an isolated space for each tenant.

The workspace registration feature is enabled by default, but can be changed with:

```javascript
SPOO.allowClientRegistrations = true | false
```

### Create a workspace

Creating a workspace is done in two steps:

1. Get a registration key via email
```curl
POST HOST/api/client/register {email: "YOUR EMAIL"}
```

2. Register a workspace with tat key
```curl
POST HOST/api/client {registrationKey: "KEY", clientname: "YOUR WORKSPACE NAME"}
```


## User accounts

User accounts are defined using an object wrapper with the `authable` flag set to `true`

```javascript
OBJY.define({
   name: "user",
   pluralName: "users",
   authable: true
})
```

## Register a user

This feature is enabled by default and can be changed with:

```javascript
CONNECT.allowUserRegistrations = true | false
```
TO BE DOCUMENTED... (coming soon)


## Metadata

The Meta Mapper is a mapper to a MongoDB instance, that holds some basic information for the platform itself. It is used for things like storing workspace information or temporary registrations keys.


```javascript
CONNECT.REST({
  ...
  metaMapper: new CONNECT.metaMappers.mongoMapper().connect("mongodb://localhost"),
  ...
}).run()
````

## Messaging system

...


## REST API



For interacting with CONNECT, there is a **REST API** and a **JavaScript SDK**.

All API Methods can be accessed in the scope of a workspace and the application, that you are working with.


Parameter | Description 
--------- | ------- 
WORKSPACE | The Workspace Name (Tenant Identifier)
APP | The App name, in which context operations will be made



```shell
curl -X GET "URL.com/api/client/<WORKSPACE>/app/<APP>"
```


## Authentication

All API Methods are only accessible by authenticated users. Authentication is handled with JWT (JSON Web Tokens). 
There are two kinds of tokens:

Token | Purpose 
--------- | ------- 
accessToken | This is issued in return to a user's credentials and can then be used to access a ressource. An access token is valid for 20 minutes.
refreshToken | Once an access token has expired, you can use the refresh token to request a new access token

### Login (Get Tokens)

> Authenticate a user

```shell
curl -X POST "URL.com/api/client/<YOUR CLIENT>/auth"
  -D {
    "username" : "peter",
    "password" : "mysupersecretpass",
    "permanent": true // stay signed in
  }

```


In order to request your tokens, a user has to authenticate using the username and password.
As a result, three things will be returned:

- Some information about the user and it's privileges
- The access token
- The refresh token


```json
{
  "user": {
    "client" : "myCompany", // client identifier
    "username" : "peter.griffin", //username
    "privileges": {   // privileges (user roles)
      "demoapp" : [   // divided into applications
        {
          "name" : "admin"
        }
      ]
    },
    "spooAdmin" : false // superuser flag (only available when user is spooAdmin)
  },
  "tokens":
  {
    "accessToken" : "95u83 iomfg adsf290....",
    "refreshToken" : "93jfna8fh29n9f...."
  }
}

```

  

**Using the access token:**


`"Authorization" : "Bearer 325nfdf89fn3-.235h8nd..."`

or as query parameter:  

`?accessToken=325nfdf89fn3-.235h8nd...
</aside>


### Relogin (refresh an access token)

> Request a new access token

```shell
curl -X POST "URL.com/api/client/<YOUR CLIENT>/token"
  -D {
    "refreshToken" : "325nfdf89fn3-.235h8nd..."
  }

```

> Refreshing a token returns the same information as in authentication

Refresh tokens are issued along with access tokens when a user authenticates.

They can be used to request a new access token, once an old token has expired (after 20 mins).

<aside class="info">
Refresh tokens can only be used once! Whenever you use it to get a new access token, you'll also get a new refresh token.
</aside>

### Logout (reject an access token)

> Reject an access token

```shell
curl -X POST "URL.com/api/client/<YOUR CLIENT>/token/reject"
  -D {
    "accessToken" : "325nfdf89fn3-.235h8nd..."
  }

```

> Respone message

```json
{
    "message": "token rejected"
}
```

After rejecting an access token, this token can no longer be used. Also, the corresponsing refresh token will be revoked.

## Applications


You can have multiple applications connected to your client. An application is basically represented by an ***Application ID***


**Add Applications**


```shell
curl -X POST "URL.com/api/client/WORKSPACE/application"
  -D {
    "name" : "myapp", // This is the application identifier!
    "displayName": "My Fancy App" // This can be used to display a pretty name
  }

```

**Get Applications**


```shell
curl -X GET "URL.com/api/client/WORKSPACE/applications"
```

> Returns

```json
[
  {
    "name" : "myapp",
    "displayName" : "My Fancy App"
  },
  {
    "name" : "anotherapp",
    "displayName" : null
  }
]
```

To get a list of all connected applications in your client, use thow follwoing syntax:


## Objects


Objects are the foundation of your applications. They represent entities, hold information, methods, listeners and events.


> Plain object schema

```javascript
{
     "_id": "5a818c47d34ee54a747bfa8e", // Unique id, auto generated
     "role": "object", // Auto generated
     "applications": ["2134124mkskfd32"], // A list of applications, where this object ist accessible from
     "inherits": ["214om214"], // A list of templates to inherit from
     "name": "rrr", // Name of the object
     "type": 'car', // Type of the object
     "onCreate": null, // Script to be executed on object creation
     "onDelete": null, // Script to be executed on object deletion
     "properties": {}, // Dynami properties
     "permissions": { // Object-wide permittions
        "admin": {
          "value": "*"
        }
     },

     // USER ONLY:
     "username": null,
     "password": "neverShown",
     "privileges": {
        "appId": "admin"
     }

     //FILE ONLY:
     "data": "/url/to/file"
}
```


**Accessing patterns**

Any one of these object types can be accessed individually or in groups

```shell
spoo.io/.../object
spoo.io/.../objects
```


### Add an object

```shell
# Works for any object wrapper, like /object, /template, /anything
curl -X POST "URL.com/api/client/<YOUR CLIENT>/app/<YOUR APP>/object"
  -D {
    "name" : "my first object"
  }
```

> Returns

```json
{
     "role": "object",
     "type": null,
     "applications": [],
     "inherits": [],
     "_id": "5a818c47d34ee54a747bfa8e",
     "name": "my first object",
     "properties": {},
     "permissions": {}
}
```


The data you pass here, will be used to initialize the object structure. Attributes that are not provided be you, will be initialized empty (null, {} or []).


### Add multiple objects

> Example

```shell
# Works for any object wrapper, like /object, /template, /anything
curl -X POST "URL.com/api/client/<YOUR CLIENT>/app/<YOUR APP>/objects"
  -D [
    {
      "name" : "my first object"
    },
    {
      "name" : "my second object"
    }
  ]

```


> Response

```json
[
  {
       "role": "object",
       "type": null,
       "applications": [],
       "inherits": [],
       "_id": "5a818c47d34ee54a747bfa8e",
       "name": "my first object",
       "onCreate": null,
       "onDelete": null,
       "properties": {},
       "permissions": {}
  },
  {
       "role": "object",
       "type": null,
       "applications": [],
       "inherits": [],
       "_id": "5a818c47d3ere54a747bfa8e",
       "name": "my second object",
       "onCreate": null,
       "onDelete": null,
       "properties": {},
       "permissions": {}
  }
]
```


### Delete an object

> Example

```shell
# Works for /object, /template, /eventlog, /file, /user
curl -X DELETE "URL.com/api/client/myCompany/app/demoapp/object/5a818c47d3ere54a747bfa8e"

```


> Response

```json
{
     "role": "object",
     "type": null,
     "applications": [],
     "inherits": [],
     "_id": "5a818c47d34ee54a747bfa8e",
     "name": "my first object",
     "properties": {},
     "permissions": {}
}
```


### Update an Object

The following methods are used to alter an object at runtime. Every Operation returns the whole updated object.


> Example

```shell
# Works for /object, /template, /file, /user
curl -X PUT "URL.com/api/client/myCompany/app/demoapp/object/5a818c47d3ere54a747bfa8e"
- D [
  { "setName" : ["my name"] },
  { "setType" : ["my type"] },
  { "addApplication" : ["demoapp"] },
  { "removeApplication" : ["otherapp"] },
  { "addInherit" : ["4iu9332423.423423"] },
  { "removeInherit" : ["3535343463463463.423423"] },
  { "setPermission" : ["admin", {"value" : "*"}] },
  { "removePermission" : ["plain_user"] },
  { "setOnCreate" : ["sendEmail", {"value: "email('from', 'to', 'hi', 'there')"}] },
  { "setOnDelete" : ["..."] }
]

```


> Response

```json
{
    "role": "object",
    "type": "my type",
    "applications": [
        "demoapp"
    ],
    "inherits": ["4iu9332423.423423"],
    "_id": "5a8e80d0e1e1282f7d3121e9",
    "name": "my name",
    "onCreate": {
      "sendEmail": {
        "value": "email('from', 'to', 'hi', 'there')"
      }
    },
    "properties": {},
    "permissions": 
    {
       "admin": {
          "value" : "*"
          }
    }
    
}
```

To alter an object's metadata, use the following methods:


Method | Description 
--------- | --------
***All object types, except EventLogs*** | 
`setName(name)` | Set the name of the object
`setType(name)` | Set the type of the object
`addApplication(applicationName)` | Bind the object to an application
`removeApplication(applicationName)` | Remove an application from the object
`addInherit(templateId)` | Add a template to extend in this object
`removeInherit(templateId)` | Remove an extended template
`setPermission(privilegeName, { value: permissionCodes })` | Set permissions
`removePermission(privilegeName)` | Remove a permission by privilege name
`setOnCreate(name, DSLSnippet)` | Set the onCreate Listener's DSL Code Snippet
`setOnChange(name, DSLSnippet)` | Set the onChange Listener's DSL Code Snippet
`setOnDelete(name, DSLSnippet)` | Set the onDelete Listener's DSL Code Snippet
***User only methods*** | 
`setUsername(username)` | Set the username of the user
`setEmail(email)` | Set the email of the user
`addPrivilege(privilegeName)` | Add a privilege
`removePrivilege(privilegeName)` | Remove a privilege



### Properties

Properties are what make an object alive. They are embedded into the "properties" section of any object.

> Basic property scheme

```javascript
{
 "_id": "dsfdsf3",
 ...
 "properties": 
  {
    "height": { // property name
      "type" : "shortText", // property type
      "value" : "5m" // the actual value
    }
  }
}
```


Additionally it can also have **permissions**, **onCreate**, **onChange**, **onDelete** and **query** (for reference types only)


**Property Types**

Attribute | Description 
--------- | ------- 
shortText | Text up to 255 characters  
longText | Longer texts with more than 255 characters
number | numeric value
boolean | boolean value (true, false)
date | An ISO 8601 date
objectRef | A reference to another object
bag | A bag of nested properties. Here you can nest properties of any other type (even bags for deeper nesting). Bags don't have the "value" field, but "properties" instead
action | An action that can be called. This holds a SPOO DSL Snippet
event | An event that will be observed by SPOO. Learn more below


#### Add/remove/set Property


> Example

```shell
# Works for /object, /template, /user
curl -X PUT "URL.com/api/client/myCompany/app/demoapp/object/5a818c47d3ere54a747bfa8e"
- D [
  { "addProperty" : ["my prop", { "type": "shortText", "value": "hi there"}} ],
  { "removeProperty" : ["someOtherProp"] },
  { "setPropertyValue" : ["my prop", "hello world"] }
]

```

#### Listeners and permissions

Properties can have Event Listeners, like onCreate, onChange and onDelete. These listeners can execute some DSL function, you define.

Permissions can be added fro access control.

> Example

```shell
# Works for /object, /template, /user
curl -X PUT "URL.com/api/client/myCompany/app/demoapp/object/5a818c47d3ere54a747bfa8e"
- D [
  { "setPropertyPermission" : ["my prop", {"privilegeName" : {"value" : "*"}}]},
  { "removePropertyPermission" : ["my prop", "plain_user"]},
  { "setPropertyConditions" : ["my prop", "smallerThan('yxz')"] },
  { "setPropertyOnChange" : ["my prop", "email('from', 'to' , 'hi', 'i was changed')"] }
]

```


**Nested Properties**


Nested properties (bags) are accessed via dot notation.


```shell
# Works for /object, /template, /user
curl -X PUT "URL.com/api/client/myCompany/app/demoapp/object/5a818c47d3ere54a747bfa8e"
- D [
  { "addProperty" : {"myBag.firstItem": { type: "shortText", value: "hi there"}} },
  { "setPropertyValue" : ["myBag.firstItem", "hello world"] }
]
```


> Response

```json
{
    "role": "object",
    "type": "my type",
    "applications": [
        "demoapp"
    ],
    "inherits": ["4iu9332423.423423"],
    "_id": "5a8e80d0e1e1282f7d3121e9",
    "name": "my name",
    "onCreate": null,
    "onDelete": null,
    "properties": 
      {
        "myBag": {
          "type" : "bag",
          "properties" : 
            {
              "firstItem": {
                "type" : "shortText",
                "value" : "hello world"
              }
            }
        }
      },
    "permissions": {}
}
```

### Special Properties

#### Actions


Actions are properties, that are able to execute some function.
Action properties don't hold information, but an executable SPOO DSL Snipped.
This allows for the user or the system to call methods directly on an object.


Learn more about SPOO DSL below

> Action Property 

```json
{
  "sayMyName": {
    "type" : "action",
    "value" : "email('<from>', '<to>', 'Say my name', dsl.object.name)"
  }
}
```



> Example: Call an action

```shell
# Works for /object, /template, /eventlog, /user

# Call an action
curl -X POST "URL.com/api/client/myCompany/app/demoapp/object/5a818c47d3ere54a747bfa8e/property/myAction/call"


```

> Response

```json
{
     "message": "action called asynchronously"
}
```



#### Events


Events are special kinds of properties. They will be observed by SPOO based on a fix date or an interval. On due, SPOO automatically triggers the action, that is defined in the event.


An event can either be defined as **recurring** or **one time**.

> Recurring Event 

```javascript
{
  "reminder": {
    "type" : "event",
    "interval" : "P10D", // Every 10 days (ISO 8601 Duration)
    "action" : "email('<from>', '<to>', 'Hey', 'There')" // DSL snipped to be executed
  }
}
```

> One time Event 

```javascript
{
  "dueDate": {
    "type" : "event",
    "date" : "2018-02-21T14:14:41+00:00", // ISO 8601
    "action" : "email('<from>', '<to>', 'Hey', 'There')" // DSL snipped to be executed
  }
}
```

> Event Methods

```shell
# Works for /object, /template, /user
curl -X PUT "URL.com/api/client/myCompany/app/demoapp/object/5a818c47d3ere54a747bfa8e"
- D [
  { "addProperty" : { "my first event": { type: "event", "date": "2018-02-21T14:14:41+00:00", "action" : "email('from', 'to', 'hi', 'i just happened')"}} },
  
  { "setEventDate" : ["my first event", "2019-02-21T14:14:41+00:00"] }, // fix date
    // or
  { "setEventInterval" : ["my second event", "P30D"] }, // recurring

  { "setEventAction" : ["my first event", "email('from', 'to', 'hi', 'i just happened, jay!')"] }
]

```


> Response

```json
{
    "role": "object",
    "type": "my type",
    "applications": [
        "demoapp"
    ],
    "inherits": ["4iu9332423.423423"],
    "_id": "5a8e80d0e1e1282f7d3121e9",
    "name": "my name",
    "properties": 
      {
        "my first event": {
          "type" : "event",
          "date" : "2019-02-21T14:14:41+00:00",
          "action" : "email('from', 'to' , 'hi', 'i just happened, jay!')"
        }
      },
      {
        "my second event": {
          "type" : "event",
          "interval" : "P30D",
          "action" : "email('from', 'to' , 'hi', 'now i am happening every 30 days')"
        }
      },
    "permissions": {}
}
```

Events are special kinds of properties (with type: 'event'). They will be observed by the system. 


To work with events, use the following methods

<aside class="info">
To add an event, use addProperty with 'event' as property type.
<br>
To remove an Event, use removeProperty
<br>
To manage permissions, use setPropertyPermission and removePropertyPermission
</aside>

**For recurring events:**

Method | Description 
--------- | --------
***All object types, except EventLogs and Files*** | 
`setEventInterval(propName, ISO8601Duration)` | Set the interval as ISO 8601 Duration String
`setEventAction(propName, DSLSnippet)` | Set the DSL Code Snippet to be executed every time the event hits the interval

**For one time events:**

Method | Description 
--------- | --------
***All object types, except EventLogs and Files*** | 
`setEventDate(propName, ISO8601Date)` | Set the date as ISO 8601 Datestring
`setEventAction(propName, DSLSnippet)` | Set the DSL Code Snippet to be executed when the event hits the date





## Querying


Querying lets you find objects by some criteria you define.

Queries can be made in two ways:

- ***Simple Queries*** To quickly search in a key/value manner
- ***Complex Queries*** To search in a more complex and broader way

You can query object's ***metadata*** and ***properties***

For metadata queries, use the name of the attribute, e.g. `name` or `type`

For property queries, use dot-notation to access single properties, e.g. `properties.height`



### Simple Queries

```shell
# Works for /objects, /templates, /eventlogs, /files, /users
curl -X POST "URL.com/api/client/myCompany/app/demoapp/objects?name=my object&type=/fir/&properties.myProp=/val/"


```


> Response

```json
[
  {
    ...
    "name" : "my object",
    "type" : "first object",
    "properties" : 
    {
      "myProp": {
        "type" : "shortText",
        "value" : "this is my value"
      }
    }
  },
  ...
]
```

Query for key/value pairs. Either match an exact value or use Regular Expressions.

Key | Value | Description
--------- | --------| --------
name | my object | Query for exact name
type | /fir/ | Query for types that have "fir" in it.
properties.myProp | /val/ | Query for property "myProp" with "val" in it

### Complex Queries

```shell
# Works for /objects, /templates, /eventlogs, /files, /users
curl -X POST "URL.com/api/client/myCompany/app/demoapp/objects?$query=$or: [{name : "my object"}, {name : "not my object"} ]}"
```


> Response

```json
[
  {
    ...
    "name" : "my object",
    "type" : "first object",
    "properties" : 
    {
      "myProp": {
        "type" : "shortText",
        "value" : "this is my value"
      }
    }
  },
  ...
]
```

This let's you run complex JSON-formatted queries with $or, $and, $in and more...
Learn more about complex query operator here...


Key | Value | Description
--------- | --------| --------
$query | {$or: [{name : "my object"}, {name : "not my object"} ]} | Perform an OR query

### Important Differences


```shell
# Works for /objects, /templates, /eventlogs, /files, /users

# simple query
curl -X POST "URL.com/api/client/myCompany/app/demoapp/objects?properties.myProp=my value"

# complex query
curl -X POST "URL.com/api/client/myCompany/app/demoapp/objects?$query={'properties.myProp.value' : 'my value'}"

# simple nested query
curl -X POST "URL.com/api/client/myCompany/app/demoapp/objects?properties.myProp.firstItem=my value"

# complex nested query
curl -X POST "URL.com/api/client/myCompany/app/demoapp/objects?$query={'properties.myProp.properties.firstProp.value' : 'my value'}"

```

<aside class="warning">
Please note, that in complex queries, properties have to be accessed with exact dot-notation, while in simple queries they are accessed by property name only.
</aside>

Examples:

***Accessing values:***

Simple Query | Description
--------- | --------
`properties.myProp : "my value"`  | In simple queries, you only have to reference the property name. 

Complex Query | Description
--------- | --------
`properties.myProp.value : "my value"`  | In complex queries you have to specify the value attribute inside the property




***Accessing nested property values:***

Simple Query | Description
--------- | --------
`properties.myBag.firstItem : "my value"`  | In simple queries, you only have to reference the property names. 

Complex Query | Description
--------- | --------
`properties.myBag.properties.firstItem.value : "my value"`  | In complex queries you have to specify the exact path to the value



## Files


Files are objects, that hold some file data.


> Upload a File


```shell
# Works for /object, /template, /user
curl -X PUT "URL.com/api/client/myCompany/app/demoapp/file"
- H "Content-Type : application/x-www-form-urlencoded"
- F "file=@/path/to/file"
- d {
  "name" : "my file"
  ...
}
```


### Get File

```shell
# Works for /object, /template, /user
curl -X GET "URL.com/api/client/myCompany/app/demoapp/file/248her1928hrr3/data?accessToken=35282hf8nf"
```

To get the file itself, the API offers a way to retrieve the path to the file.


Important: When you are using the REST API, make sure to attach your access token in the Query String. This makes it easier to share a file link.



## Permissions


Access Control lets you manage what a user can do with an object. For it to work, you need two things, that are mapped together:

- A privilege (user role)
- A permission rule

Privileges are labels that can be attached to user objects. Like "admin" or "simple_user".
You are free to name these labels.


 On the other side, the object side, permissions can be modeled by mapping user privileges to a set of permissions codes. Like "admin" : "r" (A user with the "admin" privilege can read this ressource)


<aside class="info">
Important: Privileges are divided into applications. So that a user can have different privileges in different application contexts.
</aside>

<aside class="info">
Inside permissions, you can map user privileges, or use a wildcard "<b>*</b>" to refer to all privileges
</aside>

> Example user privileges

```json
{
  ...
  "privileges" : {
    "demoapp": [    // privileges are divided into apps
      {
        "name" : "admin"
      }
    ],
    "anotherapp": [   
      {
        "name" : "plain_user"
      }
    ]
}
```
> Example object permissions

```json
{
  ...
  "permissions" : 
    {
      "admin": {  
        "value" : "*" // users with admin privileges can do anything
      }
    },
    {
      "*": {    
        "value" : "rpn" // all other users can only read, add properties and change the object name
      }
    }
}
```




### Permission Codes

These Codes can be combined to build permissions.


Code | Description 
--------- | ------- 
* | All Permissions
a | Add/remove an application from an object
r | Read (see) object or property 
d | Delete an object or property
n | Change the object name
o | Change username (user only)
h | Change email (user only)
t | Change the object type
i | Add/remove an inherit definition (extend a template)
v | Set onCreate handler
w | Set onChnage handler
z | Set onDelete handler
x | Change object/property permissions
p | Add/remove properties to objects
u | Update property values
m | Update property conditions and reference query
e | Execute an action property
f | Update action property (change DSL Snippet)
l | Change user privileges


# Authorisations

Authorisations allow you to define what a user can do with objects matching a specific query.

Example structure inside a user:

```json
{
  username: "user",
  authorisations: {
    '*': { // '*' is for "all apps"
      name: "do anything", // a name for the authorisation (optional)
      query: { // the query to match the objects
        name: {$regex: "te"}
      },
      perm: "crud" // the permission codes
    }
  }
}
```

Methods:

Method | Description
--------- | -------- |
`setAuthorisation({name: "", query: {...}, perm: "crud"})`  | Set a new authorisation |
`removeAuthorisation("authorisationName")`  | Removes an authorisation by its name |



### SPOO Admin

There is a special kind of privilege, called `spooAdmin`. This is a flag that is attached to a user object and can either be `true` or `false`.


A SPOO Admin is a super user and can perform any operation, regardless of permissions.  

When you set up your client, your initial user will be a SPOO Admin.