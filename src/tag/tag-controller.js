angular
.module('ngManager')
.controller('TagCtrl', function($scope, $http, $apiService) {
  $scope.loadTags = function($query) {
    return $apiService.get($scope.schema.tagUri, {query: $query}).then(function(res) {
      return res.filter(function(value) {
        return value.text.toLowerCase().indexOf($query.toLowerCase()) != -1;
      });
    });
  };
});

