angular
.module('ngManager')
.controller('TopCtrl', function($rootScope, $scope, $apiService) {

  $rootScope.$emit('content.title', {
    section: 'Top'
  });

})
;
