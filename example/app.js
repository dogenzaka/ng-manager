
var express = require('express');
var app = express();
var path = require('path');

app.get('/config', function(req, res) {

  res.json({

    site: {
      title: 'Example App'
    },

    entities: [{
      id: 'track',
      schema: {
        type: 'object',
        properties: {
          track_id: 'string'
        },
        required: ['track_id']
      },
      features: {
        search: true
      }
    }, {
      id: 'artist',
      schema: {
        type: 'object',
        properties: {
          artist_id: 'string'
        },
        required: ['artist_id']
      },
      features: {
        search: true
      }
    }],

    i18n: {
      en: {
        artist: 'Artist',
        artist_id: 'Artist ID',
        track: 'Track',
        track_id: 'Track ID'
      },
      ja: {
        // Words
        artist: 'アーティスト',
        artist_id: 'アーティストID',
        track: 'トラック',
        track_id: 'トラックID'
      }
    }

  });

});

app.get('/entity/:type', function(req, res) {
  var type = req.param('type');
  res.json({
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
