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
            { name: "Simple Object", code: `
// 1. Create an object wrapper
OBJY.define({name: "object",pluralName: "objects"});

// 2. Add an object
OBJY.object({
   name: "yogurt"
}).add()
  	` },
            { name: "Behaviours", code: `
OBJY.object({
   name: "yogurt",
   properties: {
   	expires: {
   	  type: "event",
   	  date: "20-20-2020",
   	  action: "..." // This action will be triggered on that date
   	}
   }
}).add()
  	` },
            { name: "Events", code: `
OBJY.object({
   name: "yogurt",
   onChange: {
   	  notify: {
   	    action: "email('i have changed')"
   	  }
   },
   onDelete: {
   	  notify: {
   	    action: "OBJY.object(this).add()"
   	  }
   }
}).add()
  	` },
            { name: "Interface", code: `
OBJY.object({
   name: "yogurt",
}).addProperty('flavour', {
   type: "text",
   value: "vanilla"
})
  	` },

            { name: "Inheritance", code: `
// 1. Create an object that serves as a template
OBJY.object({
   name: "template",
   type: "whatever"
}).add(templ => {
   // templ._id = 123
})

// 2. Add another object that inherits from the one above
OBJY.object({inherits: [123]}).add(obj => {
   // objy will look the same
})
  	` },

            { name: "Customize", code: `
OBJY.define({
  name: "item",
  pluralName: "items",
  storage: new MongoMapper('...')
})
  	` },





        ]
    }
})