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
         { name: "Properties", code: `
/*
 *  Create an object that represents some entity
 */

OBJY.object({
   name: "yogurt",
   properties: {
    flavour: {
      type: "shortText",
      value: "strawberry"
    }
   }
}).add()
    ` },
    { name: "Events", code: `
/*
 *  Create an object that executes a custom action at a specific time 
 */

OBJY.object({
   name: "yogurt",
   properties: {
    expires: {
      type: "event",
      date: "20-20-2020",
      action: "..." 
    }
   }
}).add()
    ` },
                      
            { name: "Triggers", code: `
/*
 *  Create an object that executes a custom action when the object is changed
 */

OBJY.object({
   name: "yogurt",
   onChange: {
     notify: {
       action: "email('i have changed')"
     }
   }
}).add()
  	` },
    { name: "Actions", code: `
/*
 *  Create an object with an action, that deletes the object
 */

OBJY.object({
   name: "yogurt",
   deleteMe: {
     type: "action",
     value: "obj.remove()"
   }
}).add()
    ` },
            { name: "Inheritance", code: `
/*
 *  Objects can inherit from each other.
 */

OBJY.object({
   _id: 123,
   name: "template",
   type: "whatever"
}).add(templ => {})

OBJY.object({inherits: [123]}).add(obj => {
   // obj will look the same
})
  	` },

            { name: "Customize", code: `
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





        ]
    }
})