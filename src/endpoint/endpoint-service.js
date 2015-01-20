/* global _ */
angular
.module('ngManager')
.factory('$endpointService', function() {

  var endpoints = [];
  var data = localStorage.getItem("endpoints");
  if (data) {
    endpoints = JSON.parse(data);
  }

  return {

    getAll: function() {
      return endpoints;
    },

    getSelected: function() {
      return _.find(endpoints, function(ep) {
        return ep.selected === true;
      });
    },

    get: function(index) {
      return endpoints[index];
    },

    add: function(endpoint) {
      endpoints.push(endpoint);
      this.save();
    },

    remove: function(index) {
      endpoints.splice(index, 1);
      this.save();
    },

    select: function(index) {
      _.each(endpoints, function(ep, i) {
        if (i === index) {
          ep.selected = true;
        } else {
          delete ep.selected;
        }
      });
      this.save();
    },

    save: function() {
      var list = _.map(endpoints, function(ep) {
        return _.pick(ep, 'name', 'url', 'selected');
      });
      localStorage.setItem('endpoints', JSON.stringify(list));
    }
  };

});

