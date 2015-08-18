/* global _ */
angular
.module('ngManager')
.service('$entityService', function($q, $apiService, $schemaForm, $filter) {

  var getEntityConfig = function(kind) {
    return _.find($apiService.getConfig().entities, function(entity) {
      return entity.id === kind;
    });
  };

  // normalize data fields
  var normalizeFields = function(data) {

    var features = data.features || {};

    var fields = (features.list && features.list.fields) || _.keys(data.schema.properties);

    return _.map(fields, function(field) {
      if (typeof field === 'string') {
        return { id: field };
      } else {
        return field;
      }
    });

  };

  return {

    getConfig: getEntityConfig,

    list: function(opts) {

      opts = opts || {};

      var deferred = $q.defer();

      var kind = opts.kind || '';
      var limit = opts.limit || 30;
      var offset = opts.offset || 0;

      if (kind === '') {
        deferred.reject(new Error('Kind is empty'));
        return deferred.promise;
      }

      $apiService
      .get('/entity/'+kind, {
        limit: limit,
        offset: offset
      })
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
        if (opts.initialize) {
          key = "";
        }

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
      var kind = opts.kind;
      var key = opts.key;
      var entity = opts.entity || {};
      var spec = getEntityConfig(kind);
      var _this = this;

      for(var k in spec.schema.properties){
        if (spec.schema.properties[k].onlyCreate || spec.schema.properties[k].onlyUpdate) {
          spec.schema.properties[k]["display"] = "none";
          if ( (!key && spec.schema.properties[k].onlyCreate) || (key && spec.schema.properties[k].onlyUpdate) ) {
            spec.schema.properties[k]["display"] = "";
          }
        }
      }

      var submit = function() {
        if(!key){
          key = _this.getKey({
            kind: kind,
            entity: entity
          });
        }
        var result = $apiService.put('/entity/'+kind+'/'+key, entity);
        if(!key){
          result.then(function() {
            _this.list(opts);
          });
        }
        return result;
      };

      return $schemaForm.showSide({
        schema: spec.schema,
        entity: entity,
        submit: submit
      });
    },

    getKey: function(opts) {
      var kind = opts.kind;
      var entity = opts.entity;
      var spec = getEntityConfig(kind);
      var keys = spec.schema.primaryKey;
      var key = keys.map(function(key) {
        return encodeURIComponent(entity[key] == null ? "" : entity[key]);
      }).join(',');
      return key;
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
    },

    search: function(opts) {

      return $q(function(resolve, reject) {

        var kind = opts.kind;
        if (kind === '') {
          return reject(new Error('kind is empty'));
        }

        var query = opts.query || '';
        if (query === '') {
          return reject(new Error('query is null'));
        }

        var offset = opts.offset || 0;

        $apiService
        .get('/search/entity/'+kind, {
          query: query,
          limit: 30,
          offset: offset
        })
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


    filter: function(opts) {
      return $q(function(resolve, reject) {

        var kind = opts.kind;
        if (kind === '') {
          return reject(new Error('kind is empty'));
        }

        var query = opts.query || '';
        if (query === '') {
          return reject(new Error('query is null'));
        }

        $apiService
        .get('/filter/entity/'+kind, {
          query: query,
          limit: -1,
          offset: 0
        })
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

    import: function(kind){
      var _this = this;
      var file = document.getElementById("importfile").files[0];
      var reader = new FileReader();
      var entities = null;
      reader.readAsText(file, "utf-8");

      reader.onload = function(e){

        try{
          entities = JSON.parse(e.target.result);
        } catch(error) {
          console.err(error);
        }

        // TODO: validation

        if(entities !== null){
          for(var i = 0; i < entities.length; i++){
            var key = _this.getKey({
              kind: kind,
              entity: entities[i]
            });
            $apiService.put('/entity/'+kind+'/'+key, entities[i]);
          }
        }

      };

    },

    export: function(kind){

      this.list({
        kind: kind,
        limit: -1 // getAll
      })
      .then(function(data) {
        var rows = data.list;
        var filename = kind+ "_" + $filter('date')(new Date(), 'yyyyMMddHHmm') + ".json";
        var content = JSON.stringify(rows);
        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
        window.requestFileSystem(TEMPORARY, 1024*1024, function(fileSystem){
          // create
          fileSystem.root.getFile(filename, {create: true, exclusive: false}, function(fileEntry){
            // write
            fileEntry.createWriter(function(fileWriter){
              var blob = new Blob([ content ], { "type" : "text/plain" });
              fileWriter.write(blob);
              // success
              fileWriter.onwriteend = function(e){
                console.info("writing success");
                var link = document.createElement('a');
                link.href = fileEntry.toURL();
                link.download = filename;
                document.body.appendChild(link); // for Firefox
                link.click();
                document.body.removeChild(link); // for Firefox
              };
              // failed
              fileWriter.onerror = function(e){
                console.log("writing failed");
              };
            });
          }, function(error){
              console.log("error : " + error.code);
          });
        });
      });
    }
  };

})
;

