var app = new Vue({
    el: '#app',
    watch: {
        currentExample: function() {
            setTimeout(function() {
                hljs.initHighlighting.called = false;
                hljs.initHighlighting();
            }, 1)

        }
    },
    data: {
        currentExample: 0,
        showInstallInstructions: false,
        currentPreview: 1,
        currentLang: 'JS',
        langs: [ /*'JS', 'CLI'*/ ],
        previewItems: [{ name: 'Objects', index: 1 }, { name: 'Behaviours', index: 2 }, { name: 'CRUD API', index: 3 }, { name: 'Extendable', index: 4 }],
        examples: [
         { name: "Object API", icon: 'feat-object.png', code: `
var myObj = OBJY.object({
   name: "yogurt",
   flavour: "strawberry"
})

myObj.addProperty('color', 'blue')

myObj.remove()
    ` },
    { name: "Events", icon: 'feat-events.png', code: `
/*
 *  Create an object that executes a custom action at a specific time 
 */

OBJY.object({
   name: "yogurt",
   expires: {     // a date-based event
     type: "event",
     date: "20-20-2020",
     action: () => { ... }
   },
   onChange: {    // a trigger based event
     notify: {
       action: "email('i have changed')"
     }
   }
})
    ` },
            { name: "Inherits", icon: 'feat-inheritance.png',code: `
/*
 *  Objects can inherit from each other.
 */

OBJY.object({
   _id: 123,
   name: "template",
   type: "whatever"
})

OBJY.object({
  inherits: [123]
})

/*  Will become:
    {
      _id: "xxxx",
      inherits: [123],
      name: "template",
      type: "whatever"
    }
 */
  	` },


   
     { name: "Querying", icon: 'feat-query.png', code: `
/*
 *  Objects can be queryed per object family and in different contexts like apps, permissions and tenants
 */

// Optional: set application context
OBJY.useApp('app1') // <- set an application context (optional)

// Query API using 'get' method:
OBJY.objects({
  name: "test"
}).get(data => {
  // returns queries results inside app context "app1"
})
    ` },

   { name: "External sources", icon: 'feat-mapper.png', code: `
/*
 *  Custom object wrappers can be created. Define how objects are handled internaly
 */

OBJY.define({
  name: "item", // singular name of object wrapper
  pluralName: "items", // plural name of object wrapper for bulk operations
  storage: new MongoMapper('...'), // where objects are stored
  processor: new vm2Mapper('...'), // where objects actions are processed
  observer: new intervalMapper('...') // how object events are observed
})

// Use your object wrapper for objects:
OBJY.item({
  name: "hello"
})
  	` },

{ name: "Custom source", icon: 'feat-origin.png', code: `
/*
 *  Build custom mappers for storage, observation and processing
 *  Attach third party technologies.
 */

OBJY.define({
  name: "item",
  pluralName: "items", 
  storage: OBJY.customStorage({
    getById: () => {},
    add: () => {},
    remove: () => {}
  }),
  processor: OBJY.customProcessor({
    ...
  }),
  observer: OBJY.customObserver({
    ...
  })
})

// Use your object wrapper for objects:
OBJY.item({
  name: "hello there"
})
    ` },

 { name: "Access contexts", icon: 'feat-context.png', code: `
/*
 *  Accessing objects can be done in the context of tenants, users, permissions and apps
 */

// Work in a client context
OBJY.useClient('myCompany')

// Work in an app context
OBJY.useApp('myapp')

// Work in a user context
OBJY.useUser({
  username: "peter",
  privileges: {
    app1: ["admin"]
  }
})

// Use the API in your current contexts
OBJY.object({name: "test"}).add(data => {
  /*
    {
      name: "test",
      applications: ["app1"]
    }
  */
})
` },

{ name: "Rules", icon: 'feat-rules.png', code: `
/*
 *  Define custom rules that inject custom structure into objects matching some criteria
 */

// Define affectables
OBJY.affectables = [{
  affects: { // criteria for selecting objects
    name: "test"
  },
  apply: { // Applies the props to the objects matching the criteria above
    onChange: {
      log: {
        value: () => {console.log('a change occured')}
      }
    }
  }
}]

/*  All objects with name "test" will automatically have the onChange trigger:
    {
      name: "test",
      onChange: {
        log: {
          value: () => {console.log('a change occured')}
        }
      }
    }
 */

` },


        ]
    }
})