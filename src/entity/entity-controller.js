/* global _ */
angular
.module('ngManager')
.controller('EntityCtrl', function(
  $q,
  $scope,
  $routeParams,
  $rootScope,
  $schemaForm,
  $entityService,
  $errorService,
  $window) {

    var kind = $routeParams.kind;
    var limit = 30;
    var loadCount = 1;
    var isLoading = false;
    var isSearch = false;
    var isFilter = false;

    console.info('Entity', kind);

    $rootScope.$emit('content.title', {
      section: 'Entities',
      page: kind
    });

    $scope.kind = kind;
    $scope.filter_q = {};

    var getFields = function(entityConfig) {
      var features = entityConfig.features;
      var schema = entityConfig.schema;
      var fields = features.list && features.list.fields || _.keys(schema.properties);
      return fields.map(function(field) {
        if (typeof field === 'string') {
          return { id: field };
        } else {
          return field;
        }
      });
    };

    $scope.list = function() {
      $entityService.list({
        kind: kind
      }).then(function(data) {

        // Get entity schema
        var entityConfig = $entityService.getConfig(kind);
        var fields = getFields(entityConfig);

        $scope.fields = fields;
        $scope.schema = entityConfig.schema;
        $scope.rows = data.list;

        loadCount = data.list.length;

        $scope.edit = function(row, id) {
          row.editing = id;
        };

        $scope.blur = function(row) {
          delete row.editing;
        };

        // update size after applying list
        setTimeout(resize, 0);

      }, function(err) {
        $errorService.showError(err);
      });
    };

    $scope.loadMore = function(){
      if(isLoading || isSearch || isFilter) return;

      var offset = loadCount;
      isLoading = true;

      $entityService.list({
        kind: kind,
        limit: limit,
        offset: offset
      }).then(function(data) {
        if ( data.list.length !== 0 ) {
          loadCount += data.list.length;
          $scope.rows = $scope.rows.concat(data.list);
        }
        isLoading = false;
      }, function(err) {
        $errorService.showError(err);
      });
    };

    $scope.export = function(){
      $entityService.export(kind,$scope.rows);
    };

    $scope.import = function(){
      $entityService.import(kind);
    };

    $scope.search = function(query){
      $entityService.search({
        kind: kind,
        query: query
      }).then(function(data) {
        if ( data.list.length !== 0 ) {
          $scope.rows = data.list;
          isSearch = true;
        }
      }, function(err) {
        $errorService.showError(err);
      });
    };

    $scope.filter = function(){
      console.log($scope.filter_q);
      $entityService.filter({
        kind: kind,
        query: $scope.filter_q
      }).then(function(data) {
        $scope.rows = data.list;
        isFilter = true;
      }, function(err) {
        $errorService.showError(err);
      });
    };

    var resize = function() {
      var body = document.getElementById('entity-table-body');
      var rect = body.getBoundingClientRect();
      // get body height
      var th = Math.floor($window.innerHeight - rect.top);
      body.style.height = th + 'px';
    };

    $scope.$on('window.resize', resize);

    $scope.list();

})
;

