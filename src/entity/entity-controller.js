/* global _ */
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

    $scope.list = function() {
      $entityService.list({
        kind: kind
      }).then(function(data) {

        // Get entity schema
        var entityConfig = $entityService.getConfig(kind);
        var schema = entityConfig.schema;
        var keys = entityConfig.keys || entityConfig.key;
        if (!keys) {
          keys = _.keys(schema.properties).shift();
        }
        if (typeof keys === 'string') {
          keys = [keys];
        }

        $scope.fields = data.fields;
        $scope.keys = keys;
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

