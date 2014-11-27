angular
.module('ngManager')
.factory('$schemaNormalizer', function() {

  var normalize = function(schema, path, key) {

    // prevent normalizing twice
    if (schema.$$normalized) {
      return schema;
    }

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
      // Normalize children
      _.each(schema.properties, function(prop, key) {
        schema.properties[key] = normalize(prop, path, key);
      });
      schema.keyOrder = _.keys(schema.properties);
    }

    /*
    if (schema.type === 'array') {
      // Normalize children
      _.each(schema.items, function(prop, key) {
        schema.items[key] = normalize(prop, path, key);
      });
      schema.keyOrder = _.keys(schema.properties);
    }
    */

    // Mark as normalized
    schema.$$normalized = true;

    return schema;
  };

  return normalize;

});
