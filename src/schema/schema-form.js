angular
.module('ngManager')
.factory('$schemaForm', function($materialDialog, $schemaNormalizer, $schemaValidator, $q) {

  return {
    showDialog: function(options) {

      options = options || {};

      var schema = options.schema;
      var event = options.event;
      var deferred = $q.defer();
      var submit = options.submit;

      // normalize schea
      schema = $schemaNormalizer(schema);

      $materialDialog.show({
        template: '<material-dialog><schema-form /></material-dialog>',
        targetEvent: event,
        controller: ['$scope', function($scope) {
          $scope.schema = schema;
          $scope.entity = {};
          $scope.title = options.title || '';
          $scope.errors = {};
          $scope.validate = function(path) {
            var errors = $schemaValidator.validate($scope.entity, $scope.schema, path);
            if (errors) {
              errors.forEach(function(err) {
                $scope.errors[err.path] = err.message;
              });
              $scope.hasError = true;
            } else {
              if (path) {
                delete $scope.errors[path];
              } else {
                $scope.errors = {};
              }
              $scope.hasError = false;
            }
          };
          $scope.submit = function() {
            $scope.validate();
            if ($scope.hasError) {
              return;
            }
            submit.then(function() {
              $materialDialog.hide();
            }, function(err) {
              console.error(err);
            });
          };
          $scope.cancel = function() {
            $materialDialog.hide();
          };
        }]
      });
    }
  };

})
.directive('schemaForm', function() {

  return {
    restrict: 'AE',
    controller: function() {
    },
    templateUrl: '/schema-form/form.html'
  };

})
.directive('schemaInput', function($compile) {

  var linker = function(scope, element) {

    var template = '<label for="sf{{spec.path}}" ng-bind="spec.key|translate"></label>' +
      '<material-input id="sf{{spec.path}}" type="text" ng-model="entity[key]" ng-change="validate(spec.path)"></material-input>' +
      '<span class="error" ng-bind="errors[spec.path]" />'
    ;
    template =
      '<material-input-group>'+template+'</material-input-group>'
    ;

    var content = $compile(angular.element(template))(scope);
    
    var spec = scope.spec || {};
    if (spec.style) {
      content.addClass(spec.style);
    }

    element.append(content);
  };

  return {
    restrict: 'AE',
    replace: true,
    link: linker
  };

})
;
