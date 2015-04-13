angular
.module('ngManager')
.factory('$schemaForm', function(
  $mdDialog,
  $rootScope,
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
      var theme = opts.theme || 'dialog';
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

      // normalize schea
      schema = $schemaNormalizer(schema);

      var scope = $rootScope.$new();
      scope.schema = schema;
      scope.entity = entity;
      scope.errors = {};
      scope.validate = validator(scope);

      var interim = $sideContent(scope);

      scope.submit = submitter(scope, interim, submit, deferred);
      scope.cancel = canceller(scope, interim, deferred);

      interim.show();

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
    var template = "";
    switch(schema.type) {
      case 'string':
        if (schema.enum) {
          template = $templateCache.get('schema-form/input_radio.html');
        } else if (schema.format == 'textarea') {
          template = $templateCache.get('schema-form/input_textarea.html');
        } else {
          template = $templateCache.get('schema-form/input.html');
        }
        break;
      case 'boolean':
        template = $templateCache.get('schema-form/input_boolean.html');
        break;
      case 'number':
        template = $templateCache.get('schema-form/input_number.html');
        break;
      case 'object':
        scope.entity[scope.schema.path] = scope.entity[scope.schema.path] || {};
        if (schema.format == 'file') {
          template = $templateCache.get('schema-form/input_file.html');
        } else {
          template = $templateCache.get('schema-form/input_object.html');
        }
        break;
      case 'array':
        if (schema.items && schema.items.enum) {
          scope.entity[scope.schema.path] = scope.entity[scope.schema.path] || [];
          template = $templateCache.get('schema-form/input_checkboxes.html');
        } else if (schema.format == 'tag') {
          scope.entity[scope.schema.path] = scope.entity[scope.schema.path] || [];
          template = $templateCache.get('schema-form/input_tag.html');
        } else {
          scope.entity[scope.schema.path] = scope.entity[scope.schema.path] || [];
          template = $templateCache.get('schema-form/input_array.html');
        }
        break;
    }
    
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
