angular
.module('ngManager')
.factory('$errorService', function($materialToast) {

  return {

    showError: function(err) {

      var msg = '';
      if (typeof msg === 'string') {
        msg = err;
      } else if (msg.message) {
        msg = err.message;
      } else if (err) {
        msg = err.toString();
      } else {
        msg = 'Unknown Error';
      }

      $materialToast.show({
        controller: ['$scope', function($scope) {
          $scope.message = msg;
          $scope.closeToast = function() {
            $materialToast.hide();
          };
        }],
        templateUrl: '/toasts/error.html',
        duration: 6000,
        position: 'top right'
      });

    }

  };

})
;
