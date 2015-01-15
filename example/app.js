
var express = require('express');
var app = express();
var path = require('path');
var data = require('./data');
var _ = require('lodash');
var bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  next();
});


var specs = {
  user: {
    id: 'user',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', maxLength: 100, minLength: 1 },
        firstName: { type: 'string', maxLength: 100, minLength: 1 },
        lastName: { type: 'string', maxLength: 100, minLength: 1 },
        email: { type: 'string', style: 'long' },
        phone: 'string'
      },
      primaryKey: ['userId'],
      required: ['userId','firstName','lastName']
    },

    features: {
      list: {
        fields: [
          { id: 'userId', style: { width: '120px' }},
          'firstName',
          'lastName',
          'email',
          'phone'
        ]
      },
      download: true,
      upload: true
    }
  }, 

  company: {
    id: 'company',
    schema: {
      type: 'object',
      properties: {
        companyId: { type: 'string', maxLength: 100, minLength: 1 },
        name: { type: 'string', maxLength: 100, minLength: 1 },
        phrase: 'string',
        country: 'string',
        zipCode: 'string',
        city: 'string',
        streetAddress: 'string'
      },
      primaryKey: ['companyId'],
      required: ['companyId', 'name']
    },

    features: {
      list: {
        fields: ['companyId', 'name', 'country', 'city']
      }
    }
  }
};

app.get('/config', function(req, res) {

  res.json({

    site: {
      title: 'Example App'
    },

    entities: _.values(specs),

    i18n: {
      en: {
        company: 'Company',
        companyId: 'Company ID',
        phrase: 'Phrase',
        country: 'Country',
        zipCode: 'Zip code',
        city: 'City',
        streetAddress: 'Street Address',
        user: 'User',
        userId: 'User ID',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'E-Mail',
        phone: 'Phone'
      },
      ja: {
        company: '会社',
        companyId: '会社ID',
        phrase: 'フレーズ',
        country: '国',
        zipCode: '郵便番号',
        city: '都市',
        streetAddress: '住所',
        user: 'ユーザー',
        userId: 'ユーザーID',
        firstName: '名',
        lastName: '姓',
        email: 'メールアドレス',
        phone: '電話番号'
      }
    }

  });

});

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
  var spec = specs[kind];
  var primaryKey = spec.schema.primaryKey;
  var list = data[kind];
  if (list) {
    return _.find(list, function(item) {
      return _.isEqual(pick(item, primaryKey), keys);
    });
  }
  return;
};

var search = function(kind, q){

  var list  = data[kind];
  if(list){
    return _.filter(list, function(item) {
      return _.contains(_.values(item).toString(), q);
    });
  }
  return [];
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
  var limit = Number(req.param('limit')) || 20;
  var offset = Number(req.param('offset')) || 0;

  var spec = specs[kind];
  if (!spec) {
    return res.status(404).end();
  }

  var slice;
  if(limit === -1){
    slice = data[kind];
  }else{
    slice = data[kind].slice(offset, limit+offset);
  }
  res.json({
    list: slice
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

app.put('/entity/:kind/:keys', function(req, res) {
  var kind = req.param('kind');
  var keys = req.param('keys').split(',');
  var item = find(kind, keys);
  var list = data[kind];

  if (!list) {
    res.status(404).end();
    return;
  }

  if (item) {
    list[list.indexOf(item)] = req.body;
    res.status(204).end();
  } else {
    list.push(req.body);
    res.status(201).end();
  }

});

app.put('/entity/:kind/:keys/:field', function(req, res) {
  var kind = req.param('kind');
  var keys = req.param('keys').split(',');
  var field = req.param('field');
  var item = find(kind, keys);
  if (item) {
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

app.get('/search/entity/:kind', function(req, res) {

  var kind = req.param('kind');
  var limit = Number(req.param('limit')) || 20;
  var offset = Number(req.param('offset')) || 0;
  var q = req.param('query');
  var items = search(kind,q);

  var spec = specs[kind];
  if (!spec) {
    return res.status(404).end();
  }

  var slice;
  if(limit === -1){
    slice = items;
  }else{
    slice = items.slice(offset, limit+offset);
  }
  res.json({
    list: slice
  });
});


app.use(express.static(path.resolve(__dirname,'..','app')));

module.exports = app;
