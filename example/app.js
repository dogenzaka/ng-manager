
var express = require('express');
var app = express();
var path = require('path');
var data = require('./data');
var _ = require('lodash');
var bodyParser = require('body-parser');

app.use(bodyParser.json());

app.get('/config', function(req, res) {

  res.json({

    site: {
      title: 'Example App'
    },

    entities: [{
      id: 'user',
      schema: {
        type: 'object',
        properties: {
          user_id: 'string',
          first_name: 'string',
          last_name: 'string',
          email: { type: 'string', style: 'long' },
          phone: 'string'
        },
        required: ['user_id','first_name','last_name']
      },
      features: {
        list: {
          fields: [
            { id: 'user_id', style: { width: '120px' }},
            'first_name',
            'last_name',
            'email',
            'phone'
          ]
        }
      }
    }],

    i18n: {
      en: {
        user: 'User',
        user_id: 'User ID',
        first_name: 'First Name',
        last_name: 'Last Name',
        email: 'E-Mail',
        phone: 'Phone'
      },
      ja: {
        user: 'ユーザー',
        user_id: 'ユーザーID',
        first_name: '名',
        last_name: '姓',
        email: 'メールアドレス',
        phone: '電話番号'
      }
    }

  });

});

var primaryKeys = {
  user: ['user_id']
};

// pick value for specific keys as array
var pick = function(obj, keys) {
  var items = [];
  _.each(keys, function(key) {
    items.push(obj[key]);
  });
  return items;
};

// find item in list
var find = function(kind, keys) {
  var primaryKey = primaryKeys[kind];
  var list = data[kind];
  if (list) {
    return _.find(list, function(item) {
      return _.isEqual(pick(item, primaryKey), keys);
    });
  }
  return;
};

var remove = function(kind, keys) {
  var list = data[kind];
  var item = find(kind, keys);
  if (list && item) {
    list.splice(list.indexOf(item), 1);
  }
  return;
};

app.get('/entity/:kind', function(req, res) {

  var kind = req.param('kind');
  var limit = req.param('limit') || 20;
  var offset = req.param('offset') || 0;
  // var query = req.param('query');
  var primaryKey = primaryKeys[kind];
  var slice = data[kind].slice(offset, limit);
  var list = _.map(slice, function(item) {
    var keys = pick(item, primaryKey);
    return {
      key: keys.join(','),
      data: item
    };
  });
  res.json({
    list: list
  });
});

app.get('/entity/:kind/:keys', function(req, res) {
  var kind = req.param('kind');
  var keys = req.param('keys').split(',');
  var item = find(kind, keys);
  if (item) {
    res.json(item);
  } else {
    res.status(404).end();
  }
});

app.put('/entity/:kind/:key', function(req, res) {
  res.json({
  });
});

app.put('/entity/:kind/:keys/:field', function(req, res) {
  var kind = req.param('kind');
  var keys = req.param('keys').split(',');
  var field = req.param('field');
  var item = find(kind, keys);
  if (item) {
    console.log("BODY", req.body);
    item[field] = req.body.value;
    res.status(200).end();
  } else {
    res.status(404).end();
  }
});

app.delete('/entity/:kind/:keys', function(req, res) {
  var kind = req.param('kind');
  var keys = req.param('keys').split(',');
  var item = find(kind, keys);
  if (item) {
    remove(kind, keys);
    res.status(200).end();
  } else {
    res.status(404).end();
  }
});

app.use(express.static(path.resolve(__dirname,'..','app')));

module.exports = app;
