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
      .get('/entity/'+kind)
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

      var deferred = $q.defer();

      opts = opts || {};

      var kind = opts.kind || '';
      if (kind === '') {
        deferred.reject(new Error('kind is empty'));
        return deferred.promise;
      }

      var key = opts.key;
      if (key === undefined) {
        deferred.reject(new Error('key is null'));
        return deferred.promise;
      }

      $apiService
      .get('/entity/'+kind)
      .then(function(data) {
        var config = getEntityConfig(kind);
        if (config === undefined) {
          deferred.reject({
            message: 'Entity configuration not found for {{kind}}',
            params: { kind: kind }
          });
        } else {
          deferred.resolve(data);
        }
      }, function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    showForm: function(opts) {

      var deferred = $q.defer();
      var spec = getEntityConfig(opts.kind);

      $schemaForm.showSide({
        schema: spec.schema,
        entity: opts.entity
      });

      return deferred.promise;

    },

    remove: function(opts) {

      var deferred = $q.defer();

      return deferred.promise;

    }

  };

})
;

