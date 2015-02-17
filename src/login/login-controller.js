angular
.module('ngManager')
.controller('LoginCtrl', function($scope, $rootScope, $endpointService) {

  $rootScope.$emit('content.title', {
    section: 'Login'
  });

  $scope.getUrl = function(path) {
    var ep = $endpointService.getSelected();
    var url = ep.url.replace(/(.*)\/+$/,'$1');
    path = path.replace(/^\/+(.*)$/, '$1');
    return url + '/' + path;
  };

})
;
