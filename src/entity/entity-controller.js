angular
.module('ngManager')
.controller('EntityCtrl', function(
  $scope,
  $routeParams,
  $rootScope,
  $schemaForm,
  $entityService,
  $errorService) {

    var type = $routeParams.type;

    console.info('Entity', type);

    $rootScope.$emit('content.title', {
      section: 'Entities',
      page: type
    });


})
;


