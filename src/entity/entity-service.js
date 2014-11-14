/* global _ */
angular
.module('ngManager')
.service('$entityService', function($q, $apiService, $schemaForm) {

  var getEntityConfig = function(kind) {
    return _.find($apiService.config().entities, function(entity) {
      return entity.id === kind;
    });
  };

  // normalize data fields
  var normalizeFields = function(data) {

    var features = data.features || {};

    var fields = (features.list && features.list.fields) || _.keys(data.schema.properties);

    return _.map(fields, function(field) {
      if (typeof field === 'string') {
        field = { id: field };
      }
      return field;
    });

  };

  return {

    getConfig: getEntityConfig,

    list: function(opts) {

      opts = opts || {};

      var deferred = $q.defer();

      var kind = opts.kind || '';

      if (kind === '') {
        deferred.reject(new Error('Kind is empty'));
        return deferred.promise;
      }

      $apiService
      .get('/entity/'+kind, { limit: 30 })
      .then(function(data) {

        var config = getEntityConfig(kind);
        if (config === undefined) {
          deferred.reject({
            message: 'Entity configuration not found for {{kind}}',
            params: { kind: kind }
          });
        } else {
          data.fields = normalizeFields(config);
          deferred.resolve(data);
        }

      }, function(err) {
        deferred.reject(err);
      })
      ;

      return deferred.promise;

    },

    get: function(opts) {

      opts = opts || {};

      return $q(function(resolve, reject) {

        var kind = opts.kind || '';
        if (kind === '') {
          return reject(new Error('kind is empty'));
        }

        var key = opts.key;
        if (key === undefined) {
          return reject(new Error('key is null'));
        }

        $apiService
        .get('/entity/'+kind+'/'+key)
        .then(function(data) {
          var config = getEntityConfig(kind);
          if (config === undefined) {
            reject({
              message: 'Entity configuration not found for {{kind}}',
              params: { kind: kind }
            });
          } else {
            resolve(data);
          }
        }, reject);
      });
    },

    showForm: function(opts) {

      return $q(function(resolve) {
        var spec = getEntityConfig(opts.kind);
        $schemaForm.showSide({
          schema: spec.schema,
          entity: opts.entity
        });
        resolve(spec);
      });
    },

    saveField: function(opts) {

      var kind = opts.kind;
      var key = opts.key;
      var field = opts.field;
      var value = opts.value;

      return $apiService
      .put('/entity/'+kind+'/'+key+'/'+field, { value: value })
      ;

    },

    remove: function(opts) {

      var kind = opts.kind;
      var key = opts.key;

      return $apiService.del('/entity/'+kind+'/'+key);
    }

  };

})
;

