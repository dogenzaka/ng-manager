angular
.module('ngManager')
.factory('$schemaNormalizer', function() {

  var normalize = function(schema, path, key) {

    if (typeof schema === 'string') {
      schema = { type: schema };
    }

    if (!path) {
      path = '';
    }

    schema.path = path + '/' + key;
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
