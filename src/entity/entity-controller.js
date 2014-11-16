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
        $scope.rows = data.list;

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

