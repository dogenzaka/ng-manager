angular
.module('ngManager')
.factory('$errorService', function($mdToast) {

  var showError = function(err) {
    var msg = '';
    if (typeof err === 'string') {
      msg = err;
    } else if (err.message) {
      msg = err.message;
    } else if (err) {
      msg = err.toString();
    } else {
      msg = 'Unknown Error';
    }

    $mdToast.show({
      controller: ['$scope', function($scope) {
        $scope.message = msg;
        $scope.params = err.params || {};
        $scope.closeToast = function() {
          $mdToast.hide();
        };
      }],
      templateUrl: 'toasts/error.html',
      hideDelay: 30000,
      position: 'top right'
    });
  };

  return {

    showError: showError,

  };

})
;
