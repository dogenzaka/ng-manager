'use strict';

angular
.module('ngManager', [
  'ngRoute',
  'ngAnimate',
  'ngAria',
  'ngMaterial',
  'pascalprecht.translate',
  'datePicker',
  'ngCookies',
  'naif.base64'
])
.config(function($routeProvider, $mdThemingProvider, $sceDelegateProvider) {

  console.info('Configuring theme');
  $mdThemingProvider.theme('menu')
  .primaryPalette('indigo')
  .accentPalette('orange')
  ;
  $mdThemingProvider.theme('endpoint')
  .primaryPalette('indigo')
  .accentPalette('orange')
  ;
  $mdThemingProvider.theme('entity')
  .primaryPalette('indigo')
  .accentPalette('orange')
  ;
  $mdThemingProvider.theme('login')
  .primaryPalette('indigo')
  .accentPalette('orange')
  ;
  $mdThemingProvider.theme('side')
  .primaryPalette('teal')
  .accentPalette('orange')
  ;
  $mdThemingProvider.theme('dialog')
  .primaryPalette('indigo')
  .accentPalette('orange')
  ;
  $mdThemingProvider.theme('previewDialog')
  .primaryPalette('teal')
  .accentPalette('orange')
  ;

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
  .when('/login', {
    controller: 'LoginCtrl',
    templateUrl: 'login.html'
  })
  ;

  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    '**'
  ]);


})
.run(function($rootScope, $endpointService, $apiService, $errorService, $location, $authService) {

  console.info('Started running ng-manager');

  // Check last endpoints
  var ep = $endpointService.getSelected();
  if (!ep) {
    // Select endpoints
    $location.url('/endpoints');
  } else {
    var token = $location.search().token;
    if(token){
      $authService.saveToken(token,ep);
      $location.url('/top');
    }

    $rootScope.login = $authService.checkLogin(ep);

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

