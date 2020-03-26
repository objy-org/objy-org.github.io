var app = new Vue({
  el: '#app',
  data: {
    currentPreview: 1,
    currentLang: 'JS',
    langs: ['JS', 'OBJYlang'],
    previewItems: [{name: 'Everything is an object', index: 1}, {name: 'Objects have behaviours', index: 2}, {name: 'Simple CRUD API', index: 3}, {name: 'Extendable', index: 4}]
  }
})