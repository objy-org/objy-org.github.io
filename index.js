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
    methods: {
    loadExample: function () {
      if(this.currentExample == this.examples.length) this.currentExample = -1
      this.currentExample = this.currentExample+1
    }
    },
    data: {
        currentExample: 0,
        currentApplication: 0,
        showInstallInstructions: false,
        currentPreview: 1,
        currentLang: 'JS',
        langs: [ /*'JS', 'CLI'*/ ],
        previewItems: [{ name: 'Objects', index: 1 }, { name: 'Behaviours', index: 2 }, { name: 'CRUD API', index: 3 }, { name: 'Extendable', index: 4 }],
        examples: [
         { name: "Model objects with behaviour", icon: 'feat-object.png', code: `// A simple object with events. OBJY triggers them automatically

var myObj = OBJY.object({
   name: "yogurt",
   flavour: "strawberry",
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

myObj.addProperty('color', 'blue')

myObj.remove()
    ` },
            { name: "Build relationships", icon: 'feat-inheritance.png',code: `// Objects can inherit from another

OBJY.object({
   _id: 123,          //  <----
   name: "template",  //      |
   type: "whatever"   //      |
})                    //      | inherits by id
                      //      |
OBJY.object({         //      |
  inherits: [123]     // ------
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


   
     { name: "Query objects", icon: 'feat-query.png', code: `// All OBJY objects can be queried and mutated using CRUD methods

OBJY.objects({
  name: "test"
}).get(data => {
  // [{...},{...}]
})

OBJY.object({name: "test"}).addProperty('color', 'blue');
    ` },

   { name: "Map from and to any data source", icon: 'feat-mapper.png', code: `// Custom mappers
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
  name: "hello"
})
  	` },

 { name: "Expose as platform", icon: 'feat-context.png', code: `// Use OBJY with OBJY EXPOSE to expose your objects as custom platform

var OBJY = require('objy');
var CONNECT = require('objy-connect');

OBJY.define({
  name: "asset",
  pluralName: "assets",
  storage: new MongoMapper()
})

CONNECT.REST({
  OBJY,
  port: 80
}).run()
` },

{ name: "More", icon: '', code: `// Build whatever you can imagine

OBJY.object({
  onCreate: {
    selfDestruct: {
      action: () => {
        obj.remove();
        console.log('Im gone!')
      }
    }
  }
})

`},

        ],
        applications: [
         /*{ name: "OBJY framework", details: 'OBJY can come very handy inside of many types of applications. For larger or smaller things', code: `
OBJY.object({
  name: "Hi there",
  type: "message",
  onCreate: {
    destroy: {
      action: () => {
        obj.remove()
      }
    }
  }
})
`},*/

 /*{ name: "Understand",  details: 'Real life objects have characteristics, behaviour and can take actions. OBJY objects can do the same. This allows you to represent real use cases with OBJY.', html: '<span class="leto-text-xxl"><span class="fa fa-car"></span></span>', code: `
var OBJY = require('objy');
var OBJY_CATALOG = require('objy-catalog');

OBJY.define({
  name: "item",
  pluralName: "items",
  storage: new OBJY_CATALOG.mappers.storage.mongoDB(...)
})
`},
*/
 { name: "Use in any JS Environment", html: '<span class="leto-text-xxl"><span class="fab fa-js"></span> &nbsp; <span class="fab fa-node"></span></span>', link: {label: 'Install now', url: 'docs/#/./DOCUMENTATION?id=installing'}, code: `
var OBJY = require('objy');
var OBJY_CATALOG = require('objy-catalog');

OBJY.define({
  name: "item",
  pluralName: "items",
  storage: new OBJY_CATALOG.mappers.storage.mongoDB(...)
})
`},
          { name: "Build your own cloud platform", html: '<span class="leto-text-xxl"><span class="fa fa-cloud"></span></span>', link: {label: 'With SPOO', url: 'docs/#/./ECOSYSTEM?id=spoo-build-your-own-platform'}, code: `
var SPOO = require('spoojs');
var OBJY = require('objy');

OBJY.define({
  name: "asset",
  pluralName: "assets",
  storage: new MongoMapper()
})

SPOO.REST({
  OBJY: OBJY,
  port: 80
}).run()
`},

 { name: "Learn OBJY", html: '<span class="leto-text-xxl"><span class="fa fa-lightbulb"></span></span>', link: {label: 'Read the docs now', url: 'docs/#/./DOCUMENTATION'}, code: `
var SPOO = require('spoojs');
var OBJY = require('objy');

OBJY.define({
  name: "asset",
  pluralName: "assets",
  storage: new MongoMapper()
})

SPOO.REST({
  OBJY: OBJY,
  port: 80
}).run()
`},


     
        ]
    }
})