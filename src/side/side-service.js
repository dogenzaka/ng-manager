angular
.module('ngManager')
.service('$sideContent', function($rootElement,
                                  $mdSidenav,
                                  $mdTheming,
                                  $animate,
                                  $timeout,
                                  $window,
                                  $compile) {

  var lastScope = null;
  var lastElement = null;

  return function(scope) {

    if (lastScope) {
      lastScope.$destroy();
      lastElement.remove();
      lastScope = null;
    }

    var element = $compile('<md-sidenav class="md-sidenav-right md-whiteframe-z2 side-form" md-component-id="right-form"><md-content layout="column"><schema-form /></md-content></md-sidenav>')(scope);

    var show = function() {
      $rootElement.find('body').append(element);
      $mdSidenav('right-form').toggle();
      lastScope = scope;
      lastElement = element;
    };

    var hide = function() {
      $mdSidenav('right-form').close();
    };

    return {
      show: show,
      hide: hide
    };
  };
});
