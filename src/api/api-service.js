angular
.module('ngManager')
.factory('$apiService', function($q, $endpointService, $http, $rootScope) {

  var config = null;

  // Resolves URL from path data
  var getUrl = function(path) {
    var ep = $endpointService.getSelected();
    var url = ep.url.replace(/(.*)\/+$/,'$1');
    path = path.replace(/^\/+(.*)$/, '$1');
    return url + '/' + path;
  };

  var resolution = function(resolve) {
    return function(result) {
      return resolve(result.data);
    };
  };

  var rejection = function(reject) {
    return function(result) {
      var msg = (result.data && result.data.message) || result.statusText;
      var err = new Error(msg);
      err.status = status;
      reject(err);
    };
  };

  // sends GET request
  var get = function(path, query) {
    return $q(function(resolve, reject) {
      $http({
        url: getUrl(path),
        method: 'GET',
        params: query
      })
      .then(resolution(resolve), rejection(reject));
    });
  };

  // sends POST request
  // data will be stringified as JSON object
  var post = function(path, data) {
    return $q(function(resolve, reject) {
      $http({
        url: getUrl(path),
        method: 'PUT',
        data: data
      })
      .then(resolution(resolve), rejection(reject));
    });
  };

  // sends PUT request
  // data will be stringified as JSON object
  var put = function(path, data) {
    return $q(function(resolve, reject) {
      $http({
        url: getUrl(path),
        method: 'PUT',
        data: data
      })
      .then(resolution(resolve), rejection(reject));
    });
  };

  var del = function(path, query) {
    return $q(function(resolve, reject) {
      $http({
        url: getUrl(path),
        method: 'DELETE',
        params: query
      })
      .then(resolution(resolve), rejection(reject));
    });
  };

  var search = function(path, query) {
    return $q(function(resolve, reject) {
      $http({
        url: getUrl(path),
        method: 'GET',
        params: query
      })
      .then(resolution(resolve), rejection(reject));
    });
  }

  var getConfig = function() {
    return $q(function(resolve, reject) {
      if (config !== null) {
        resolve(config);
      } else {
        console.info('Getting config');
        get('/config')
        .then(
          resolve,
          reject
        );
      }
    });
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

    getConfig: function() {
      return config;
    },

    get: get,

    post: post,

    put: put,

    del: del,

    search: search

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

