'use strict';

angular
.module('ngManager', [
  'ngRoute',
  'ngAnimate',
  'ngAria',
  'ngMaterial',
  'pascalprecht.translate',
  'angular-loading-bar'
])
.config(function($routeProvider) {

  console.info('Configuring routings');

  $routeProvider
  .when('/endpoints', {
    controller: 'EndpointCtrl',
    templateUrl: 'endpoints.html'
  })
  .when('/top', {
    controller: 'TopCtrl',
    templateUrl: 'top.html'
  })
  .when('/entity/:type', {
    controller: 'EntityCtrl',
    templateUrl: 'entity.html'
  })
  /*
  .otherwise({
    redirectTo: '/'
  })
  */
  ;

})
.run(function($endpointService, $apiService, $errorService) {

  console.info('Started running ng-manager');

  // Check last endpoints
  var ep = $endpointService.getSelected();
  if (!ep) {
    // Select endpoints
    location.hash = '/endpoints';
  } else {
    $apiService
    .setup()
    .then(function() {
      location.hash = 'top';
    }, function(err) {
      $errorService.showError(err);
    });
  }
})
;

