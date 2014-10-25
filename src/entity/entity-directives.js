angular
.module('ngManager')
.directive('entityTable', function() {

  return {
    restrict: 'AE',
    link: function() {
    },
    templateUrl: 'entity/table.html'
  };

})
.directive('entityRow', function($entityService, $errorService) {

  return {

    restrict: 'AE',
    scope: {
      key: '=',
      row: '=',
      fields: '=',
      kind: '='
    },
    replace: true,
    link: function(scope) {

      var kind = scope.kind;
      var key = scope.key;

      scope.edit = function() {

        $entityService
        .get({ kind: kind, key: key })
        .then(function(data) {
          $entityService.showForm({
            kind: kind,
            entity: data
          });
        }, function(err) {
          $errorService.showError(err);
        });

      };

      scope.remove = function() {

        $entityService
        .remove({ kind: kind, key: key })
        .then(function(data) {
        }, function(err) {
          $errorService.showError(err);
        });

      };

    },
    templateUrl: 'entity/row.html'

  };

})
.directive('entityCell', function($entityService) {

  return {

    restrict: 'AE',
    scope: {
      key: '=',
      field: '=',
      row: '=',
      kind: '='
    },
    replace: true,
    link: function(scope, element) {

      var row = scope.row;
      var field = scope.field;
      var key = scope.key;
      
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

