angular
.module('ngManager')
.directive('entityTable', function() {

  return {
    restrict: 'AE',
    link: function(scope, element) {

      var body = element.children().eq(1);

      body.on('scroll', function(e) {

        var target = e.target;
        var pos = target.scrollTop;

      });

      scope.$on('entity.removed', function(e, data) {
        var rows = scope.rows;
        console.log(data);
        rows.splice(rows.indexOf(data.row), 1);
      });

    },
    templateUrl: 'entity/table.html'
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

      // show modification form
      scope.edit = function() {

        $entityService
        .get({ kind: kind, key: row.key })
        .then(function(data) {
          $entityService.showForm({
            kind: kind,
            entity: data
          });
        }, function(err) {
          $errorService.showError(err);
        });

      };

      // remove the entity of the row
      scope.remove = function() {

        if (scope.removing) {

          $entityService
          .remove({ kind: kind, key: row.key })
          .then(function() {
            $rootScope.$broadcast('entity.removed', {
              kind: kind,
              key: row.key,
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
      row: '=',
      kind: '='
    },
    replace: true,
    link: function(scope, element) {

      var kind = scope.kind;
      var row = scope.row;
      var field = scope.field;
      
      scope.edit = function() {
        scope.editing = true;
        setTimeout(function() {

          var save = function() {
            scope.saving = true;
            scope.error = false;
            $entityService.saveField({
              kind: kind,
              key: row.key,
              field: field.id,
              value: row.data[field.id]
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
          var orig = row.data[field.id];
          input.bind('keyup', function(evt) {
            switch (evt.keyCode) {
              case 27: // ESC
                row.data[field.id] = orig;
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
            if (orig !== row.data[field.id]) {
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

