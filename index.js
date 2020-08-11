var app = new Vue({
  el: '#app',
  data: {
    currentPreview: 1,
    currentLang: 'JS',
    langs: [/*'JS', 'CLI'*/],
    previewItems: [{name: 'Objects', index: 1}, {name: 'Behaviours', index: 2}, {name: 'CRUD API', index: 3}, {name: 'Extendable', index: 4}]
  }
})