angular
.module('ngManager')
.factory('$schemaForm', function(
  $mdDialog,
  $sideContent,
  $schemaNormalizer,
  $schemaValidator,
  $q) {

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

  var submitter = function(scope, interim, submit, deferred) {
    return function() {
      scope.validate();
      if (scope.hasError) {
        return;
      }
      if (!submit) {
        interim.hide();
        deferred.reject();
      }
      submit(scope).then(function() {
        interim.hide();
        deferred.resolve(scope.entity);
      }, function(err) {
        deferred.reject(err);
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
    showDialog: function(opts) {

      opts = opts || {};

      var schema = opts.schema;
      var entity = opts.entity || {};
      var event = opts.event;
      var deferred = $q.defer();
      var submit = opts.submit;
      var theme = opts.theme || 'indigo';
      // normalize schea
      schema = $schemaNormalizer(schema);

      $mdDialog.show({
        template: '<md-dialog md-theme="'+theme+'"><schema-form /></md-dialog>',
        targetEvent: event,
        controller: ['$scope', function($scope) {
          $scope.schema = schema;
          $scope.entity = entity;
          $scope.title = opts.title || '';
          $scope.errors = {};
          $scope.validate = validator($scope);
          $scope.submit = submitter($scope, $mdDialog, submit, deferred);
          $scope.cancel = canceller($scope, $mdDialog, deferred);
        }]
      });

      return deferred.promise;
    },

    showSide: function(opts) {

      var schema = opts.schema;
      var entity = opts.entity || {};
      var deferred = $q.defer();
      var submit = opts.submit;
      var theme = opts.theme || 'teal';

      // normalize schea
      schema = $schemaNormalizer(schema);

      $sideContent.show({
        template: '<md-content md-theme="'+theme+'"><schema-form /></md-content>',
        targetEvent: event,
        controller: ['$scope', function($scope) {
          $scope.schema = schema;
          $scope.entity = entity;
          $scope.errors = {};
          $scope.validate = validator($scope);
          $scope.submit = submitter($scope, $sideContent, submit, deferred);
          $scope.cancel = canceller($scope, $sideContent, deferred);
        }]
      });

      return deferred.promise;
    }

  };

})
.directive('schemaForm', function() {

  return {
    restrict: 'AE',
    templateUrl: 'schema-form/form.html'
  };

})
.directive('schemaItem', function($compile, $templateCache) {

  var linker = function(scope, element) {

    var schema = scope.schema;
    if(schema.type === 'string')
      var template = $templateCache.get('schema-form/input.html');
    if(schema.type === 'boolean')
      var template = $templateCache.get('schema-form/input_boolean.html');
    if(schema.type === 'number')
      var template = $templateCache.get('schema-form/input_number.html');
    if(schema.type === 'array')
      var template = $templateCache.get('schema-form/input_array.html');
    var content = $compile(angular.element(template))(scope);
    
    if (schema.style) {
      content.addClass(schema.style);
    }

    element.append(content);
  };

  return {
    scope: {
      schema: '=',
      entity: '=',
      errors: '='
    },
    restrict: 'AE',
    replace: true,
    link: linker
  };

})
.directive('schemaEnumItem', function($compile, $templateCache) {

  var linker = function(scope, element) {

    var schema = scope.schema;
    var template = $templateCache.get('schema-form/input_enum_item.html');
    var content = $compile(angular.element(template))(scope);
    
    if (schema.style) {
      content.addClass(schema.style);
    }

    element.append(content);
  };

  return {
    scope: {
      schema: '=',
      entity: '=',
      errors: '='
    },
    restrict: 'AE',
    replace: true,
    link: linker
  };

})
;
