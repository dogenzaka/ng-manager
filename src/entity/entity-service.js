angular
.module('ngManager')
.service('$entityService', function($apiService) {

  return {

    list: function(opts, callback) {

      if (_.isFunction(opts)) {
        callback = opts;
        opts = {};
      }

    },


  };

})
;

