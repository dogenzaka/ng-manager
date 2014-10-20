angular
.module('ngManager')
.controller('TopCtrl', function($rootScope) {

  $rootScope.$emit('content.title', {
    section: 'Top'
  });

})
;
