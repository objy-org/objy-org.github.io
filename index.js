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
         { name: "Basics", icon: 'feat-object.png', code: `
var myObj = OBJY.object({
   name: "yogurt",
   flavour: "strawberry"
})

myObj.addProperty('color', 'blue')

myObj.remove()
    ` },
    { name: "Events", code: `
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
            { name: "Inheritance", code: `
/*
 *  Objects can inherit from each other.
 */

OBJY.object({
   _id: 123,
   name: "template",
   type: "whatever"
})

OBJY.object({inherits: [123]})
  	` },

     { name: "Object example", code: `
/*
 *  Objects can have multiple, even nested props, triggers, events, ...
 */

OBJY.object({
   name: "credit card",
   owner: 'Peter Griffin',
   expires: {       // <- an event that is observed by objy
     type: "event",
     date: "20-20-2020",
     action: () => { ... }
   },
   deleteMe: {      // <- an action that that runs some cusom function
     type: "action",
     value: () => { OBJY(this._id).remove() }
   },
   onDelete: {    // <- a crud-trigger that runs some custom functionality
    notify: {
    action: () => { /* email or something */ }
    }
   }
})
    ` },

   { name: "External sources", code: `
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
  	` },

{ name: "Custom source", code: `
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
    ` },



        ]
    }
})