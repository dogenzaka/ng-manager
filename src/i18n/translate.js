angular
.module('ngManager')
.provider('$translateLoader', function() {

  var tables = {};

  var mergeTables = function(table, lang) {
    var map = tables[lang];
    if (!map) {
      map = tables[lang] = {};
    }
    tables[lang] = _.merge(table, map);
  };

  this.translations = function(lang, table) {
    mergeTables(table, lang);
  };

  this.$get = function($q) {

    var service = function(options) {
      var key = options.key;
      var deferred = $q.defer();
      deferred.resolve(tables[key] || {});
      return deferred.promise;
    };

    service.addTables = function(newTables) {
      _.each(newTables, mergeTables);
    };

    return service;
  };
})
.config(function($translateProvider) {
  $translateProvider.useLoader('$translateLoader');
  $translateProvider.determinePreferredLanguage();
});


