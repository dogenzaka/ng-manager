angular
.module('ngManager')
.factory('sharedScopes', function ($rootScope) {
    var sharedScopes = {};
    return {
        setScope: function (key, value) {
            sharedScopes[key] = value;
        },
        getScope: function (key) {
            return sharedScopes[key];
        }
    };
});
