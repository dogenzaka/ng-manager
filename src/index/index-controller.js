
angular
.module('ngManager')
.controller('IndexCtrl', function(
  $scope,
  $rootScope,
  $mdSidenav,
  $timeout,
  $interval,
  $location,
  $window,
  $translate,
  $translateLoader) {

    $scope.toggleMenu = function() {
      $timeout(function() {
        $mdSidenav('left').toggle();
      });
    };

    $scope.site = { title: 'NG-Manager' };

    $scope.head = {};

    $scope.moveTo = function(path) {
      $location.url(path);
      $mdSidenav('left').close();
    };

    $rootScope.$on('content.title', function(evt, title) {
      $scope.head.title = title;
    });

    $rootScope.$on('progress.start', function() {
      $scope.progress = { mode: 'query', value: 0 };
    });

    $rootScope.$on('progress.end', function() {
      var progress = $scope.progress;
      if (progress.mode === 'query') {
        $timeout(function() {
          $scope.progress = false;
        }, 500);
      } else if (progress.mode === 'determinate') {
        var p = $interval(function() {
          progress.value += 20;
          if (progress.value >= 100) {
            $interval.cancel(p);
            $timeout(function() {
              delete $scope.progress;
            }, 400);
          }
        }, 50);
      }
    });

    $scope.openRight = true;

    $rootScope.$on('config', function(evt, config) {
      console.info('Loaded configuration', config);
      $scope.config = config;
      $scope.site = config.site;

      if (config.i18n) {
        $translateLoader.addTables(config.i18n);
        $translate.refresh();
      }
    });

    $window.addEventListener('resize', function(evt) {
      $rootScope.$broadcast('window.resize');
    });
});
