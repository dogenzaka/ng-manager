
var express = require('express');
var app = express();
var path = require('path');
var data = require('./data');
var _ = require('lodash');

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

var pick = function(obj, keys) {
  var items = [];
  _.each(keys, function(key) {
    items.push(obj[key]);
  });
  return items;
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
  var list = data[kind];
  var primaryKey = primaryKeys[kind];

  if (list) {
    var item = _.find(list, function(item) {
      return _.isEqual(pick(item, primaryKey), keys);
    });
    if (item) {
      res.json(item);
      return;
    }
  }
  res.status(404).end();
});

app.put('/entity/:kind/:key', function(req, res) {
  res.json({
  });
});

app.delete('/entity/:kind/:key', function(req, res) {
  res.json({
  });
});

app.use(express.static(path.resolve(__dirname,'..','app')));

module.exports = app;
