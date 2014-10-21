angular
.module('ngManager')
.factory('$schemaForm', function($mdDialog, $sideContent, $schemaNormalizer, $schemaValidator, $q) {


  var validator = function(scope) {
    return function(path) {
      var errors = $schemaValidator.validate(scope.entity, scope.schema);
      if (errors) {
        errors.forEach(function(err) {
          scope.errors[err.path] = err.message;
        });
        scope.hasError = true;
      } else {
        if (path) {
          delete scope.errors[path];
        } else {
          scope.errors = {};
        }
        scope.hasError = false;
      }
    };
  };

  var submitter = function(scope, interim, deferred) {
    return function() {
      scope.validate();
      if (scope.hasError) {
        return;
      }
      scope.submit.then(function() {
        interim.hide();
        deferred.resolve(scope.entity);
      }, function(err) {
        console.error(err);
      });
    };
  };

  var canceller = function(scope, interim, deferred) {
    return function() {
      interim.hide();
      deferred.reject();
    };
  };

  return {
    showDialog: function(options) {

      options = options || {};

      var schema = options.schema;
      var event = options.event;
      var deferred = $q.defer();

      // normalize schea
      schema = $schemaNormalizer(schema);

      $mdDialog.show({
        template: '<md-dialog><schema-form /></md-dialog>',
        targetEvent: event,
        controller: ['$scope', function($scope) {
          $scope.schema = schema;
          $scope.entity = {};
          $scope.title = options.title || '';
          $scope.errors = {};
          $scope.validate = validator($scope);
          $scope.submit = submitter($scope, $mdDialog, deferred);
          $scope.cancel = canceller($scope, $mdDialog, deferred);
        }]
      });

      return deferred;
    },

    showSide: function(opts) {

      var schema = opts.schema;
      var entity = opts.entity || {};
      var deferred = $q.defer();
      console.log("WHOOOSAAAA");

      $sideContent.show({
        template: '<md-dialog><schema-form /></md-dialog>',
        targetEvent: event,
        controller: ['$scope', function($scope) {
          $scope.schema = schema;
          $scope.entity = entity;
          $scope.errors = {};
          $scope.validate = validator($scope);
          $scope.submit = submitter($scope, $sideContent, deferred);
          $scope.cancel = canceller($scope, $sideContent, deferred);
        }]
      });

      return deferred;
    }

  };

})
.directive('schemaForm', function() {

  return {
    restrict: 'AE',
    controller: function() {
    },
    templateUrl: 'schema-form/form.html'
  };

})
.directive('schemaInput', function($compile) {

  var linker = function(scope, element) {

    var spec = scope.spec || {};
    var path = spec.path;

    var template = '<label for="sf-'+path+'" ng-bind="spec.key|translate"></label>' +
      '<md-input id="sf-'+path+'" type="text" ng-model="entity[spec.path]" ng-change="validate(spec.path)"></md-input>' +
      '<span class="error" ng-bind="errors[spec.path]" />'
    ;
    template =
      '<md-input-group>'+template+'</md-input-group>'
    ;

    var content = $compile(angular.element(template))(scope);
    
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
