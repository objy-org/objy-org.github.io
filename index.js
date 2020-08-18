var app = new Vue({
  el: '#app',
  watch: {
  	currentExample: function(){
  		 hljs.initHighlightingOnLoad();
  	}
  },
  data: {
  	currentExample:0, 	
  	showInstallInstructions: false,
    currentPreview: 1,
    currentLang: 'JS',
    langs: [/*'JS', 'CLI'*/],
    previewItems: [{name: 'Objects', index: 1}, {name: 'Behaviours', index: 2}, {name: 'CRUD API', index: 3}, {name: 'Extendable', index: 4}],
  	examples: [
  	{name: "Simple object", code: `
OBJY.object({
   name: "yogurt"
}).add()
  	`},
  	{name: "Behaviours", code: `
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
  	`},
  	{name: "Events", code: `
OBJY.object({
   name: "yogurt",
   onChange: {
   	  notify: {
   	    action: "email('i have changed')"
   	  }
   }
}).add()
  	`},
  	{name: "Interface", code: `
OBJY.object({
   name: "yogurt",
}).addProperty('flavour', {
   type: "text",
   value: "vanilla"
})
  	`},
  	{name: "Customize", code: `
OBJY.define({
  name: "item",
  pluralName: "items",
  storage: new MongoMapper('...')
})
  	`}
  	]
  }
})