'use strict';

angular
.module('ngManager', [
  'ngRoute',
  'ngAnimate',
  'ngAria',
  'ngMaterial',
  'pascalprecht.translate',
  'angular-loading-bar'
])
.config(["$routeProvider", function($routeProvider) {

  console.info('Configuring routings');

  $routeProvider
  .when('/endpoints', {
    controller: 'EndpointCtrl',
    templateUrl: 'endpoints.html'
  })
  .when('/top', {
    controller: 'TopCtrl',
    templateUrl: 'top.html'
  })
  .when('/entity/:type', {
    controller: 'EntityCtrl',
    templateUrl: 'entity.html'
  })
  /*
  .otherwise({
    redirectTo: '/'
  })
  */
  ;

}])
.run(["$endpointService", "$apiService", "$errorService", function($endpointService, $apiService, $errorService) {

  console.info('Started running ng-manager');

  // Check last endpoints
  var ep = $endpointService.getSelected();
  if (!ep) {
    // Select endpoints
    location.hash = '/endpoints';
  } else {
    $apiService
    .setup()
    .then(function() {
      //location.hash = 'top';
    }, function(err) {
      $errorService.showError(err);
    });
  }
}])
;


angular
.module('ngManager')
.factory('$apiService', ["$q", "$endpointService", "$http", "$rootScope", function($q, $endpointService, $http, $rootScope) {

  var config = null;

  var getUrl = function(path) {
    var ep = $endpointService.getSelected();
    var url = ep.url.replace(/(.*)\/+$/,'$1');
    path = path.replace(/^\/+(.*)$/, '$1');
    return url + '/' + path;
  };

  var get = function(path, query) {

    var deferred = $q.defer();

    $http({
      url: getUrl(path),
      method: 'GET',
      params: query
    })
    .then(function(data) {
      deferred.resolve(data.data);
    }, function(data, status) {
      var msg = (data && data.message) || 'Server error';
      var err = new Error(msg);
      err.status = status;
      deferred.reject(err);
    });

    return deferred.promise;

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
      var deferred = $q.defer();
      console.log('apiService.setup');
      config = null;
      getConfig()
      .then(function(data) {
        config = data;
        console.info('Got config', config);
        $rootScope.$emit('config', config);
        deferred.resolve(config);
      }, function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

  };

}])
.factory('progressHttpInterceptor', ["$rootScope", "$q", function($rootScope,$q) {
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
}])
.config(["$httpProvider", function($httpProvider) {
  $httpProvider.interceptors.push('progressHttpInterceptor');
}])
;


angular
.module('ngManager')
.controller('EndpointCtrl', ["$q", "$scope", "$rootScope", "$schemaForm", "$endpointService", "$apiService", "$errorService", function(
  $q,
  $scope,
  $rootScope,
  $schemaForm,
  $endpointService,
  $apiService,
  $errorService) {

  $scope.endpoints = $endpointService.getAll();

  $scope.remove = function(index) {
    $endpointService.remove(index);
  };

  $scope.select = function(index) {
    $endpointService.select(index);
    $apiService
    .setup()
    .then(function() {
      location.hash = 'top';
    }, function(err) {
      $errorService.showError(err);
    })
    ;
  };

  var add = function(endpoint) {
    $endpointService.add(endpoint);
  };

  $rootScope.$emit('content.title', {
    section: 'Endpoints'
  });

  // Showing form for adding new schema
  $scope.showForm = function($event) {

    $schemaForm.showDialog({
      title: 'Add the endpoint',
      event: $event,
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          url: { type: 'string', format: 'uri', style: 'long' }
        },
        required: ['name','url']
      },
      submit: function(scope) {
        var deferred = $q.defer();
        var entity = scope.entity;
        add(entity);
        deferred.resolve();
        return deferred.promise;
      }
    });

  };

}]);

angular
.module('ngManager')
.factory('$endpointService', function() {
        
  var endpoints = [];
  var data = localStorage.getItem("endpoints");
  if (data) {
    endpoints = JSON.parse(data);
  }

  return {

    getAll: function() {
      return endpoints;
    },

    getSelected: function() {
      return _.find(endpoints, function(ep) {
        return ep.selected === true;
      });
    },

    get: function(index) {
      return endpoints[index];
    },

    add: function(endpoint) {
      endpoints.push(endpoint);
      this.save();
    },

    remove: function(index) {
      endpoints.splice(index, 1);
      this.save();
    },

    select: function(index) {
      _.each(endpoints, function(ep, i) {
        if (i === index) {
          ep.selected = true;
        } else {
          delete ep.selected;
        }
      });
      this.save();
    },

    save: function() {
      var list = _.map(endpoints, function(ep) {
        return _.pick(ep, 'name', 'url', 'selected');
      });
      localStorage.setItem('endpoints', JSON.stringify(list));
    }
  };
        
        
});


angular
.module('ngManager')
.controller('EntityCtrl', ["$scope", "$routeParams", "$rootScope", "$schemaForm", "$entityService", "$errorService", function(
  $scope,
  $routeParams,
  $rootScope,
  $schemaForm,
  $entityService,
  $errorService) {

    var type = $routeParams.type;

    console.info('Entity', type);

    $rootScope.$emit('content.title', {
      section: 'Entities',
      page: type
    });


}])
;



angular
.module('ngManager')
.service('$entityService', ["$apiService", function($apiService) {

  return {

    list: function(opts, callback) {

      if (_.isFunction(opts)) {
        callback = opts;
        opts = {};
      }

    },


  };

}])
;


angular
.module('ngManager')
.factory('$errorService', ["$mdToast", function($mdToast) {

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

      $mdToast.show({
        controller: ['$scope', function($scope) {
          $scope.message = msg;
          $scope.closeToast = function() {
            $mdToast.hide();
          };
        }],
        templateUrl: '/toasts/error.html',
        duration: 6000,
        position: 'top right'
      });

    }

  };

}])
;

angular
.module('ngManager')
.config(["$translateLoaderProvider", function($translateLoaderProvider) {

  console.info('i18n: en');
  $translateLoaderProvider.translations('en', {
    name: 'Name',
    url: 'URL'
  });

}])
;

angular
.module('ngManager')
.config(["$translateLoaderProvider", function($translateLoaderProvider) {

  console.info('i18n: ja');

  $translateLoaderProvider.translations('ja', {
    // Words
    Add: '追加',
    Cancel: 'キャンセル',
    Create: '作成',
    Endpoints: 'エンドポイント',
    Entities: 'データ',
    Name: '名前',
    Update: '更新',
    Modify: '編集',
    Remove: '削除',
    Search: '検索',
    Settings: '設定',
    Submit: '送信',
    Top: 'トップ',
    // Labels
    name: 'Name',
    url: 'URL',
    // Sentences
    'Add the endpoint': 'エンドポイント追加'
  });

}])
;


angular
.module('ngManager')
.provider('$translateLoader', function() {

  var tables = {};

  var mergeTables = function(table, lang) {
    var map = tables[lang];
    if (!map) {
      map = tables[lang] = {};
    }
    tables[lang] = _.merge(table, map);
  };

  this.translations = function(lang, table) {
    mergeTables(table, lang);
  };

  this.$get = ["$q", function($q) {

    var service = function(options) {
      var key = options.key;
      var deferred = $q.defer();
      deferred.resolve(tables[key] || {});
      return deferred.promise;
    };

    service.addTables = function(newTables) {
      _.each(newTables, mergeTables);
    };

    return service;
  }];
})
.config(["$translateProvider", function($translateProvider) {
  $translateProvider.useLoader('$translateLoader');
  $translateProvider.determinePreferredLanguage();
}]);




angular
.module('ngManager')
.controller('IndexCtrl', ["$scope", "$rootScope", "$mdSidenav", "$timeout", "$interval", "$translate", "$translateLoader", function($scope, $rootScope, $mdSidenav, $timeout, $interval, $translate, $translateLoader) {

  $scope.toggleMenu = function() {
    $timeout(function() {
      $mdSidenav('left').toggle();
    });
  };

  $scope.site = { title: 'NG-Manager' };

  $scope.head = {};

  $scope.moveTo = function(path) {
    location.hash = path;
    $mdSidenav('left').toggle();
  };

  $rootScope.$on('content.title', function(evt, title) {
    $scope.head.title = title;
  });

  $rootScope.$on('progress.start', function() {
    $scope.progress = { mode: 'indeterminate', value: 0 };
  });

  $rootScope.$on('progress.end', function() {
    var progress = $scope.progress;
    if (progress.mode === 'indeterminate') {
      progress.mode = 'determinate';
      progress.value = 0;
    }
    var p = $interval(function() {
      progress.value += 20;
      if (progress.value >= 100) {
        $interval.cancel(p);
        $timeout(function() {
          delete $scope.progress;
        }, 200);
      }
    }, 50);
  });

  $rootScope.$on('config', function(evt, config) {
    console.info('Loaded configuration', config);
    $scope.config = config;
    $scope.site = config.site;

    if (config.i18n) {
      $translateLoader.addTables(config.i18n);
      $translate.refresh();
    }
  });

}]);

angular
.module('ngManager')
.factory('$schemaForm', ["$mdDialog", "$schemaNormalizer", "$schemaValidator", "$q", function($mdDialog, $schemaNormalizer, $schemaValidator, $q) {

  return {
    showDialog: function(options) {

      options = options || {};

      var schema = options.schema;
      var event = options.event;
      var submit = options.submit;

      // normalize schea
      schema = $schemaNormalizer(schema);

      $mdDialog.show({
        template: '<md-dialog><schema-form /></md-dialog>',
        targetEvent: event,
        controller: ['$scope', function($scope) {
          $scope.schema = schema;
          $scope.entity = {};
          $scope.title = options.title || '';
          $scope.errors = {};
          $scope.validate = function(path) {
            var errors = $schemaValidator.validate($scope.entity, $scope.schema, path);
            console.log(errors, $scope.entity, $scope.schema)
            if (errors) {
              errors.forEach(function(err) {
                $scope.errors[err.path] = err.message;
              });
              $scope.hasError = true;
            } else {
              if (path) {
                delete $scope.errors[path];
              } else {
                $scope.errors = {};
              }
              $scope.hasError = false;
            }
          };
          $scope.submit = function() {
            $scope.validate();
            if ($scope.hasError) {
              return;
            }
            submit.then(function() {
              $mdDialog.hide();
            }, function(err) {
              console.error(err);
            });
          };
          $scope.cancel = function() {
            $mdDialog.hide();
          };
        }]
      });
    }
  };

}])
.directive('schemaForm', function() {

  return {
    restrict: 'AE',
    controller: function() {
    },
    templateUrl: '/schema-form/form.html'
  };

})
.directive('schemaInput', ["$compile", function($compile) {

  var linker = function(scope, element) {

    var spec = scope.spec || {};
    var path = spec.path;

    var template = '<label for="sf-'+path+'" ng-bind="spec.key|translate"></label>' +
      '<md-input id="sf-'+path+'" type="text" ng-model="entity[spec.path]" ng-change="validate(spec.path)"></md-input>' +
      '<span class="error" ng-bind="errors[spec.path]" />'
    ;
    template =
      '<md-input-group>'+template+'</md-input-group>'
    ;

    var content = $compile(angular.element(template))(scope);
    
    if (spec.style) {
      content.addClass(spec.style);
    }

    element.append(content);
  };

  return {
    restrict: 'AE',
    replace: true,
    link: linker
  };

}])
;

angular
.module('ngManager')
.factory('$schemaNormalizer', function() {

  var normalize = function(schema, path, key) {

    if (typeof schema === 'string') {
      schema = { type: schema };
    }

    if (path) {
      schema.path = path + '.' + key;
    } else {
      schema.path = key;
    }

    schema.key = key;

    if (schema.type === 'object') {
      _.each(schema.properties, function(prop, key) {
        schema.properties[key] = normalize(prop, path, key);
      });
    }

    return schema;
  };
  return normalize;

});

/* global tv4 */
angular
.module('ngManager')
.factory('$schemaValidator', function() {
      
  /**
  * formats
  */
  var formats = {
    /**
     * This SHOULD be a date in ISO 8601 format of YYYY-MM-DDThh:mm:ssZ in UTC time.
     * This is the recommended form of date/timestamp.
     *
     * Also supports YYYY-MM-DDThh:mm:ss.SSSTZD (e.g. 2012-12-10T19:20:30.456+09:00)
     */
    'date-time': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+\-]\d{2}:\d{2})$/,

    /**
     * This SHOULD be a date in the format of YYYY-MM-DD.
     * It is recommended that you use the "date-time" format
     * instead of "date" unless you need to transfer only the date part.
     */
    'date': /^\d{4}-\d{2}-\d{2}$/,

    /**
     * This SHOULD be a time in the format of hh:mm:ss.
     * It is recommended that you use the "date-time" format
     * instead of "time" unless you need to transfer only the time part.
     *
     * Also supports hh:mm:ss.SSS (e.g. 19:20:30.456)
     */
    'time': /^\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?$/,

    /**
     * This SHOULD be the difference, measured in milliseconds,
     * between the specified time and midnight, 00:00 of January 1, 1970 UTC.
     * The value SHOULD be a number (integer or float).
     */
    'utc-millisec': function(input) { return !isNaN(parseInt(input,10));},

    /**
     * A regular expression, following the regular expression specification
     * from ECMA 262/Perl 5.
     */
    'regex': function(input) {
      try {
        new RegExp(input);
      } catch(e) {
        return false;
      }
      return true;
    },

    /**
     * This is a CSS color (like "#FF0000" or "red"),
     * based on CSS 2.1 [W3C.CR-CSS21-20070719].
     * rgb() format is also allowed.
     * Not only 17 'basic color names specified in CSS 2.1, 143 'X11 color names' are also allowed.
     */
    'color': /^(?:(?:#?[0-9a-fA-F]{3,6})|(?:rgb\(\s*\b(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*\))|(?:rgb\(\s*(?:\d?\d%|100%)\s*,\s*(?:\d?\d%|100%)\s*,\s*(?:\d?\d%|100%)\s*\))|(?:maroon|red|orange|yellow|olive|green|purple|fuchsia|lime|teal|aqua|blue|navy|black|gray|silver|white|indianred|lightcoral|salmon|darksalmon|lightsalmon|crimson|firebrick|darkred|pink|lightpink|hotpink|deeppink|mediumvioletred|palevioletred|lightsalmon|coral|tomato|orangered|darkorange|gold|lightyellow|lemonchiffon|lightgoldenrodyellow|papayawhip|moccasin|peachpuff|palegoldenrod|khaki|darkkhaki|lavender|thistle|plum|violet|orchid|magenta|mediumorchid|mediumpurple|amethyst|blueviolet|darkviolet|darkorchid|darkmagenta|indigo|slateblue|darkslateblue|mediumslateblue|greenyellow|chartreuse|lawngreen|limegreen|palegreen|lightgreen|mediumspringgreen|springgreen|mediumseagreen|seagreen|forestgreen|darkgreen|yellowgreen|olivedrab|darkolivegreen|mediumaquamarine|darkseagreen|lightseagreen|darkcyan|cyan|lightcyan|paleturquoise|aquamarine|turquoise|mediumturquoise|darkturquoise|cadetblue|steelblue|lightsteelblue|powderblue|lightblue|skyblue|lightskyblue|deepskyblue|dodgerblue|cornflowerblue|mediumslateblue|royalblue|mediumblue|darkblue|midnightblue|cornsilk|blanchedalmond|bisque|navajowhite|wheat|burlywood|tan|rosybrown|sandybrown|goldenrod|darkgoldenrod|peru|chocolate|saddlebrown|sienna|brown|snow|honeydew|mintcream|azure|aliceblue|ghostwhite|whitesmoke|seashell|beige|oldlace|floralwhite|ivory|antiquewhite|linen|lavenderblush|mistyrose|gainsboro|lightgrey|darkgray|dimgray|lightslategray|slategray|darkslategray))$/i,

    /**
     * This is a CSS style definition (like "color: red; background-color:#FFF"),
     * based on CSS 2.1 [W3C.CR-CSS21-20070719].
     */
    'style': /^\s*[^:]+\s*:\s*[^:;]+\s*;{0,1}\s*$/,

    /**
     * This value SHOULD be a URI.
     *
     * http://snipplr.com/view/6889/regular-expressions-for-uri-validationparsing/
     */
    'uri': /^(?:(?:[a-z0-9+.\-]+:\/\/)(?:(?:(?:[a-z0-9-._~!$&'()*+,;=:]|%[0-9A-F]{2})*)@)?(?:(?:[a-z0-9-._~!$&'()*+,;=]|%[0-9A-F]{2})*)(?::(?:\d*))?(?:\/(?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*)?|(?:[a-z0-9+.\-]+:)(?:\/?(?:[a-z0-9-._~!$&'()*+,;=:@]|%[0-9A-F]{2})+(?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*)?)(?:\?(?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*)?(?:#(?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*)?$/i,

    /*
     * This SHOULD be an email address.
     *
     * http://fightingforalostcause.net/misc/2006/compare-email-regex.php
     */
    'email': /^(?!(?:(?:\x22?\x5C[\x00-\x7E]\x22?)|(?:\x22?[^\x5C\x22]\x22?)){255,})(?!(?:(?:\x22?\x5C[\x00-\x7E]\x22?)|(?:\x22?[^\x5C\x22]\x22?)){65,}@)(?:(?:[\x21\x23-\x27\x2A\x2B\x2D\x2F-\x39\x3D\x3F\x5E-\x7E]+)|(?:\x22(?:[\x01-\x08\x0B\x0C\x0E-\x1F\x21\x23-\x5B\x5D-\x7F]|(?:\x5C[\x00-\x7F]))*\x22))(?:\.(?:(?:[\x21\x23-\x27\x2A\x2B\x2D\x2F-\x39\x3D\x3F\x5E-\x7E]+)|(?:\x22(?:[\x01-\x08\x0B\x0C\x0E-\x1F\x21\x23-\x5B\x5D-\x7F]|(?:\x5C[\x00-\x7F]))*\x22)))*@(?:(?:(?!.*[^.]{64,})(?:(?:(?:xn--)?[a-z0-9]+(?:-[a-z0-9]+)*\.){1,126}){1,}(?:(?:[a-z][a-z0-9]*)|(?:(?:xn--)[a-z0-9]+))(?:-[a-z0-9]+)*)|(?:\[(?:(?:IPv6:(?:(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){7})|(?:(?!(?:.*[a-f0-9][:\]]){7,})(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,5})?::(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,5})?)))|(?:(?:IPv6:(?:(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){5}:)|(?:(?!(?:.*[a-f0-9]:){5,})(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,3})?::(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,3}:)?)))?(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9]{2})|(?:[1-9]?[0-9]))(?:\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9]{2})|(?:[1-9]?[0-9]))){3}))\]))$/i,

    /**
     * This SHOULD be an ip version 4 address.
     */
    'ipv4': /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,

    /**
     * This SHOULD be an ip version 6 address.
     *
     * http://home.deds.nl/~aeron/regex/
     */
    'ipv6': /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i,

    /**
     * This SHOULD be a host-name.
     */
    'host-name'
      : /^(?:(?:[a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/
  };
 

  _.each(formats, function(format, key) {

    if (typeof format === 'function') {
      tv4.addFormat(key, function(data) {
        // do not check empty value
        if (data === null || data === undefined || data.length === 0) {
          return null;
        }
        if (format(data)) {
          return null;
        } else {
          return 'must be valid format: ' + key;
        }
      });
    } else {
      tv4.addFormat(key, function(data) {
        // do not check empty value
        if (data === null || data === undefined || data.length === 0) {
          return null;
        }
        if (format.test(data)) {
          return null;
        } else {
          return 'must be valid ' + key;
        }
      });
    }
  });

  var normalize = function(data) {

    if (typeof data === 'object') {
      // remove empty data
      _.each(data, function(val, key) {
        if (val === '' || val === undefined || val === null) {
          delete data[key];
        } else if (typeof val === 'object') {
          normalize(data[key]);
        }
      });
    }

  };

  return {

    validate: function(data, schema, path) {

      normalize(data);

      var result = tv4.validateMultiple(data, schema);
      if (result.valid) {
        return null;
      } else {
        _.each(result.errors, function(err) {
          var keyPath = '/';
          if (err.dataPath) {
            keyPath = err.dataPath;
          }
          if (err.params.key) {
            keyPath = err.dataPath + '/' + err.params.key;
          }
          keyPath = keyPath.split('/');
          keyPath.shift();
          err.path = keyPath.join('.');
        });
        if (path) {
          for (var i = 0; i < result.errors.length; i++) {
            var err = result.errors[i];
            if (err.path === path) {
              return [err];
            }
          }
          return null;
        } else {
          return result.errors;
        }
      }
    }

  };

});


angular
.module('ngManager')
.controller('TopCtrl', ["$rootScope", "$scope", "$apiService", function($rootScope, $scope, $apiService) {

  $rootScope.$emit('content.title', {
    section: 'Top'
  });

}])
;


//# sourceMappingURL=maps/main.js.map