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

   { name: "Map from and to any data source", icon: 'feat-mapper.png', code: `
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

// Custom mappers
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

 { name: "Expose as platform", icon: 'feat-context.png', code: `// Use OBJY with SPOO to expose your objects as custom platform
 
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
 { name: "OBJY Catalog", details: 'A collection of ready-to-use mappers for connecting third-party technologies', link: {label: 'Github', url: 'https://github.com/objy-org/objy-catalog'}, code: `
var OBJY = require('objy');
var OBJY_CATALOG = require('objy-catalog');

OBJY.define({
  name: "item",
  pluralName: "items",
  storage: new OBJY_CATALOG.mappers.storage.mongoDB(...)
})
`},
          { name: "SPOO", details: 'Create custom platforms, using the OBJY-based framework SPOO', link: {label: 'Explore SPOO', url: 'https://spoo.io'}, code: `
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