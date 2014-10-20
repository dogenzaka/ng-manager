angular
.module('ngManager')
.factory('$apiService', function($q, $endpointService, $http, $rootScope) {

  var config = null;

  var getUrl = function(path) {
    var ep = $endpointService.getSelected();
    var url = ep.url.replace(/(.*)\/+$/,'$1');
    path = path.replace(/^\/+(.*)$/, '$1');
    return url + '/' + path;
  };

  var get = function(path, query) {

    return $http({
      url: getUrl(path),
      method: 'GET',
      params: query
    })
    .then(function(data) {
      return data.data;
    }, function(data, status) {
      var msg = (data && data.message) || 'Server error';
      var err = new Error(msg);
      err.status = status;
      return err;
    });

  };

  var getConfig = function() {

    var deferred = $q.defer();

    if (config !== null) {
      deferred.resolve(config);
    } else {
      console.info('Getting config');
      get('/config')
      .then(
        deferred.resolve.bind(deferred),
        deferred.reject.bind(deferred)
      );
    }
    return deferred.promise;
  };

  return {

    setup: function() {
      console.log('apiService.setup');
      config = null;
      return getConfig().then(function(data) {
        config = data;
        $rootScope.$emit('config', config);
        return config;
      }, function(err) {
        return err;
      });
    },

    config: function() {
      return config;
    },

    get: get

  };
})
.factory('progressHttpInterceptor', function($rootScope, $q) {
  var stack = 0;
  var inc = function() {
    if (stack++ === 0) {
      $rootScope.$emit('progress.start');
    }
  };
  var dec = function() {
    if (--stack === 0) {
      stack = 0;
      $rootScope.$emit('progress.end');
    }
  };

  return {
    request: function(config) {
      inc();
      return config || $q.when(config);
    },
    requestError: function(rejection) {
      dec();
      return $q.reject(rejection);
    },
    response: function(response) {
      dec();
      return response || $q.when(response);
    },
    responseError: function(rejection) {
      dec();
      return $q.reject(rejection);
    }
  };
})
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('progressHttpInterceptor');
})
;

