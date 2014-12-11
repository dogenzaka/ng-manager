angular
.module('ngManager')
.controller('EndpointCtrl', function( $q, $scope, $rootScope, $schemaForm, $endpointService, $apiService, $errorService) {

    var max_num = 3;
    $scope.endpoints_org = $endpointService.getAll();
    $scope.endpoints = $scope.endpoints_org.slice(0, max_num);

    $scope.remove = function(index) {
      $endpointService.remove(index);
    };

    $scope.select = function(index) {
      $endpointService.select(index);
      $apiService
      .setup()
      .then(function() {
        location.hash = 'top';
      }, function(err) {
        $errorService.showError(err);
      })
      ;
    };

    var add = function(endpoint) {
      $endpointService.add(endpoint);
    };

    $rootScope.$emit('content.title', {
      section: 'Settings',
      page: 'Endpoints'
    });

    $scope.loadMore = function(){
      if(max_num < $scope.endpoints_org.length){
        max_num++;
        $scope.endpoints = $scope.endpoints_org.slice(0, max_num);
      }
    }

    // Showing form for adding new schema
    $scope.showForm = function($event) {

      $schemaForm.showDialog({
        title: 'Add the endpoint',
        event: $event,
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            url: { type: 'string', format: 'uri', style: 'long' },
          },
          required: ['name','url']
        },
        submit: function(scope) {
          var deferred = $q.defer();
          var entity = scope.entity;
          add(entity);
          deferred.resolve();
          return deferred.promise;
        }
      });

    };

  }
);
