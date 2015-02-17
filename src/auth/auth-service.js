/* global _ */
angular
.module('ngManager')
.factory('$authService', function($q, $location, $rootScope, $endpointService, $apiService) {

  var tokens = [];
  var data = localStorage.getItem('tokens');
  if(data){
    tokens = JSON.parse(data);
  }

  var logout = function(){

    var ep = $endpointService.getSelected();

    if(!ep){
      return;
    } else {
      $apiService.get('/logout').then(function(){
        tokens = _.filter(tokens, function(token){
          return (token.name !== ep.name);
        });
        localStorage.setItem('tokens', JSON.stringify(tokens));
        $rootScope.login = checkLogin(ep);
      })
      ;
    }
  };

  var saveToken = function(token,ep){

    // Update Token if exist
    var item = _.findWhere(tokens, { 'name': ep.name });
    if(item){
      tokens[tokens.indexOf(item)].token = token;
    } else {
      tokens.push({
        name: ep.name,
        token: token
      });
    }

    //save to local strage
    var list = _.map(tokens, function(t) {
      return _.pick(t, 'name', 'token');
    });
    localStorage.setItem('tokens', JSON.stringify(list));

  };

  var checkLogin = function(ep){
    var list = _.find(tokens, function(t){
      return t.name === ep.name;
    });
    return list;
  };

  return {

    logout: logout,
    
    saveToken: saveToken,
    
    checkLogin: checkLogin

  };

})
;

