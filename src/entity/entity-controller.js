angular
.module('ngManager')
.controller('EntityCtrl', function(
  $scope,
  $routeParams,
  $rootScope,
  $schemaForm,
  $entityService,
  $errorService,
  $window) {

    var kind = $routeParams.kind;
    var max_num = 10;

    console.info('Entity', kind);

    $rootScope.$emit('content.title', {
      section: 'Entities',
      page: kind
    });

    $scope.kind = kind;

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
        $scope.rows_org = data.list;
//        $scope.rows = data.list;
        $scope.rows = $scope.rows_org.slice(0, max_num);


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
      if(max_num < $scope.rows_org.length){
        max_num++;
        $scope.rows = $scope.rows_org.slice(0, max_num);
      }
    }

    $scope.export = function($event){
      $entityService.export(kind,$scope.rows_org);
    }

    $scope.import = function($event){
      $entityService.import(kind,$scope.rows_org);
    }

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

