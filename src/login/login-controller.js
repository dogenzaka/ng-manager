angular
.module('ngManager')
.controller('LoginCtrl', function($scope, $rootScope) {

  $rootScope.$emit('content.title', {
    section: 'Login'
  });

})
;
