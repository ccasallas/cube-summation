/*
Author:       Carlos Casallas
Description: Main app
*/
var vm = new Vue({
  el: '#app',
  data: function() {
    return {
      debug: false,
      dataTestCases: {}
    }
  },
  methods: {
    onDataReady: function(dataTestCases) { //handler for data-ready event from data-reader
      this.dataTestCases = dataTestCases;
    }
  }
});
