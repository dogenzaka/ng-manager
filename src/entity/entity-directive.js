angular
.module('ngManager')
.directive('entityTable', function($entityService) {

  return {
    restrict: 'AE',
    link: function(scope) {

      var kind = scope.kind;

      scope.add = function() {
        $entityService.showForm({ kind: kind }, function(data) {
        });
      };

      scope.$on('entity.removed', function(e, data) {
        var rows = scope.rows;
        rows.splice(rows.indexOf(data.row), 1);
      });

    },
    templateUrl: 'entity/table.html'
  };

})
.directive('headCell', function() {

  return {

    restrict: 'AE',
    scope: false,
    replace: true,
    link: function(scope) {

      scope.opening = '';

      scope.open = function(){
        scope.opening = 'is_open';
      };

      scope.close = function(){
        scope.opening = '';
      };
      
      scope.blur = function(){
        scope.opening = '';
      };

    },
    templateUrl: 'entity/head-cell.html'

  };

})
.directive('entityRow', function($entityService, $errorService, $document, $rootScope) {

  return {

    restrict: 'AE',
    scope: {
      row: '=',
      fields: '=',
      kind: '='
    },
    replace: true,
    link: function(scope) {

      var kind = scope.kind;
      var row = scope.row;

      scope.key = $entityService.getKey({ kind: kind, entity: row });

      // show modification form
      scope.edit = function() {

        $entityService
        .get({ kind: kind, key: scope.key })
        .then(function(data) {
          $entityService.showForm({
            kind: kind,
            key: scope.key,
            entity: data
          }).then(function() {
            scope.row = data;
          });
        }, function(err) {
          $errorService.showError(err);
        });

      };

      // remove the entity of the row
      scope.remove = function() {

        if (scope.removing) {

          var key = $entityService.getKey({ kind: kind, entity: row });

          $entityService
          .remove({ kind: kind, key: key })
          .then(function() {
            $rootScope.$broadcast('entity.removed', {
              kind: kind,
              key: key,
              row: row
            });
          }, function(err) {
            $errorService.showError(err);
          });

        } else {

          scope.removing = true;

        }

      };

      scope.cancelRemoving = function() {
        delete scope.removing;
      };

      scope.$on('$destroy', function() {
        $document.off('click', scope.cancelRemoving);
      });

    },
    templateUrl: 'entity/row.html'

  };

})
.directive('entityCell', function($entityService) {

  return {

    restrict: 'AE',
    scope: {
      field: '=',
      key: '=',
      row: '=',
      kind: '='
    },
    replace: true,
    link: function(scope, element) {

      var kind = scope.kind;
      var row = scope.row;
      var field = scope.field;
      var key = scope.key;
      
      scope.edit = function() {
        scope.editing = true;
        setTimeout(function() {

          var save = function() {
            scope.saving = true;
            scope.error = false;
            if (typeof orig === 'string') {
              row[field.id] = input[0].value;
            } else {  
              try {
                row[field.id] = JSON.parse(input[0].value);
              } catch (err) {
                console.log("ERROR. JSON.parse failed");
                scope.error = err;
                scope.saving = false;
                return;
              }
            }
            // TODO : validation

            $entityService.saveField({
              kind: kind,
              key: key,
              field: field.id,
              value: row[field.id]
            }).then(function() {
              scope.saving = false;
            }, function(err) {
              scope.saving = false;
              scope.error = err;
            });
            scope.$digest();
          };

          var input = element.find('input');
          input.focus();
          var orig = row[field.id];
          input.bind('keyup', function(evt) {
            switch (evt.keyCode) {
              case 27: // ESC
                row[field.id] = orig;
                scope.$digest();
                input.blur();
                break;
              case 13: // ENTER
                save();
                input.blur();
                break;
            }
          });
          input.bind('blur', function() {
            if (orig !== row[field.id]) {
              // Saving new value?
              // save();
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

