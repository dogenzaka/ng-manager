
var express = require('express');
var app = express();
var path = require('path');
var data = require('./data');

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
          email: 'string',
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
          ],
          keys: ['user_id']
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

app.get('/entity/:type', function(req, res) {
  var type = req.param('type');
  res.json({
    list: data[type].slice(0, 20)
  });
});

app.get('/entity/:type/:id', function(req, res) {
  var type = req.param('type');
  var id = req.param('id');
  res.json({
  });
});

app.put('/entity/:type/:id', function(req, res) {
  var type = req.param('type');
  var id = req.param('id');
  res.json({
  });
});

app.delete('/entity/:type/:id', function(req, res) {
  var type = req.param('type');
  var id = req.param('id');
  res.json({
  });
});

app.use(express.static(path.resolve(__dirname,'..','app')));

module.exports = app;
