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
          var keyPath = '';
          if (err.params.key) {
            keyPath = '/' + err.params.key;
          }
          err.path = err.dataPath + keyPath;
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

