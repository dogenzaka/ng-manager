angular
.module('ngManager')
.directive('entityTable', function() {

  return {

    restrict: 'AE',
    link: function(scope, element) {
    },
    templateUrl: 'entity/table.html'
  };

})
.directive('entityRow', function($entityService) {

  return {

    restrict: 'AE',
    scope: {
      row: '=',
      fields: '=',
      schema: '='
    },
    replace: true,
    link: function(scope) {

      scope.edit = function() {

        console.log("EDITING ROW", scope.row);
        $entityService.showForm({
          entity: scope.row.data,
          schema: scope.schema
        });

      };

      scope.remove = function() {

        console.log("REMOVING ROW", scope.row);

      };

    },
    templateUrl: 'entity/row.html'

  };

})
.directive('entityCell', function($entityService) {

  return {

    restrict: 'AE',
    scope: {
      id: '@',
      field: '=',
      row: '=',
      schema: '='
    },
    replace: true,
    link: function(scope, element) {

      var row = scope.row;
      var field = scope.field;
      var schema = scope.schema;
      
      scope.edit = function() {
        scope.editing = true;
        setTimeout(function() {
          var input = element.find('input');
          input.focus();
          var orig = row.data[field.id];
          input.bind('keyup', function(evt) {
            switch (evt.keyCode) {
              case 27: // ESC
                row.data[field.id] = orig;
                scope.$digest();
                input.blur();
                break;
              case 13: // ENTER
                input.blur();
                break;
            }
          });
          input.bind('blur', function() {
            if (orig !== row.data[field.id]) {
              // Saving new value
              console.log("SAVING NEW FIELD", row.data[field.id]);
            }
          });
        }, 0);
      };

      scope.blur = function() {
        scope.editing = false;
      };

    },
    templateUrl: 'entity/cell.html'

  };

})
;

