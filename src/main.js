'use strict';

angular
.module('ngManager', [
  'ngRoute',
  'ngAnimate',
  'ngAria',
  'ngMaterial',
  'pascalprecht.translate'
])
.config(function($routeProvider) {

  console.info('Configuring routings');

  $routeProvider
  .when('/endpoints', {
    controller: 'EndpointCtrl',
    templateUrl: 'endpoint.html'
  })
  .when('/top', {
    controller: 'TopCtrl',
    templateUrl: 'top.html'
  })
  .when('/entity/:kind', {
    controller: 'EntityCtrl',
    templateUrl: 'entity/index.html'
  })
  /*
  .otherwise({
    redirectTo: '/'
  })
  */
  ;

})
.run(function($endpointService, $apiService, $errorService, $location) {

  console.info('Started running ng-manager');

  // Check last endpoints
  var ep = $endpointService.getSelected();
  if (!ep) {
    // Select endpoints
    $location.url('/endpoints');
  } else {
    $apiService
    .setup()
    .then(function() {
      //location.hash = 'top';
    }, function(err) {
      $errorService.showError(err);
    });
  }
})
;

