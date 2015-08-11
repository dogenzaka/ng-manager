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
  $schemaNormalizer,
  $window,
  sharedScopes) {

    var kind = $routeParams.kind;
    var limit = 30;
    var loadCount = 1;
    var isLoading;
    var isSearch = false;
    var isFilter = false;
    var query;

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
          field = { id: field, label: field };
        }
        field.label = field.label || field.id;
        if (field.label.indexOf('.') >= 0) {
          field.label = field.id.substr(field.label.indexOf('.')+1);
        } else {
          field.label = field.id;
        }
        return field;
      });
    };

    var getSearchSchema = function(entityConfig) {
      // TODO : normalize
      var schema = entityConfig.features.search && entityConfig.features.search.schema || {};
      return $schemaNormalizer(schema);
    };

    $scope.list = function() {

      isLoading = true;

      $entityService.list({
        kind: kind
      }).then(function(data) {

        // Get entity schema
        var entityConfig = $entityService.getConfig(kind);
        var fields = getFields(entityConfig);
        var searchSchema = getSearchSchema(entityConfig);

        $scope.fields = fields;
        $scope.schema = entityConfig.schema;
        $scope.rows = data.list;
        $scope.searchSchema = searchSchema;

        loadCount = data.list.length;

        $scope.edit = function(row, id) {
          row.editing = id;
        };

        $scope.blur = function(row) {
          delete row.editing;
        };

        // update size after applying list
        setTimeout(resize, 0);

        isLoading = false;

      }, function(err) {
        $errorService.showError(err);
      });
    };

    $scope.loadMore = function(){
      if(isLoading || isFilter) return;

      var offset = loadCount;

      if (offset % limit != 0) {
        return;
      }

      isLoading = true;

      Promise.resolve()
      .then(function(){
        if (isSearch) {
          return $entityService.search({
            kind: kind,
            query: query,
            limit: limit,
            offset: offset
          })
        }
        return $entityService.list({
          kind: kind,
          limit: limit,
          offset: offset
        })
      })
      .then(function(data){
        if ( data.list.length !== 0 ) {
          loadCount += data.list.length;
          $scope.rows = $scope.rows.concat(data.list);
          isLoading = false;
        }
      }, function(err) {
        $errorService.showError(err);
        isLoading = false;
      });
    };

    $scope.export = function(){
      $entityService.export(kind,$scope.rows);
    };

    $scope.import = function(){
      $entityService.import(kind);
    };

    $scope.search = function(){
      query = $scope.searchForm;
      if (sharedScopes.getScope('TagCtrl')) {
        var scopeTagCtrl = sharedScopes.getScope('TagCtrl').entity;
        _.each($scope.searchSchema.properties, function(i,v){
         if (i.type === 'array' && i.format === 'tag') {
           query[v] = scopeTagCtrl[v];
         }
        });
      }
      $entityService.search({
        kind: kind,
        query: query,
        offset: 0
      }).then(function(data) {
        $scope.rows = data.list;
        loadCount = data.list.length;
        isSearch = true;
      }, function(err) {
        $errorService.showError(err);
      });
    };

    $scope.toggleSearchform = function(){

      if(!$scope.searchForm){
        $scope.searchForm = {};
      }

      if(!$scope.toggled){
        $scope.toggled = true;
      } else {
        $scope.toggled = !$scope.toggled;
      }
    };

    $scope.filter = function(){
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

});
