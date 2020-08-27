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
                      
            { name: "Behaviours", code: `
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
            { name: "Fluent API", code: `
/*
 *  A simple fluent interface makes handling objects very simple
 */

OBJY.object({
   name: "yogurt",
}).addProperty('flavour', {
   type: "text",
   value: "vanilla"
}).setType('product').save()
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