angular
.module('ngManager')
.service('$sideContent', function($rootElement, $$interimElement, $animate, $timeout, $window) {

  var $sideService;

  var onShow = function(scope, element, options) {

    // Always wrapping jqlite like mdDialog
    options.parent = angular.element(options.parent);

    var backdrop = angular.element('<md-backdrop class="opaque ng-enter">');
    options.backdrop = backdrop;

    options.onClickOutside = function(e) {
      if (e.target === backdrop[0]) {
        $timeout($sideService.cancel);
      }
    };

    options.onKeyupRoot = function(e) {
      if (e.keyCode === 27) {
        $timeout($sideService.cancel);
      }
    };

    var resize = function() {
      var height = $window.innerHeight;
      element.css('height', height + 'px');
    };
    resize();

    $rootElement.bind('click', options.onClickOutside);
    $rootElement.bind('keyup', options.onKeyupRoot);

    scope.$on('window.resize', resize);

    $animate.enter(element, options.parent).then(function() {
      $animate.enter(backdrop, options.parent, null);
    });
  };

  var onRemove = function(scope, element, options) {
    if (options.backdrop) {
      $animate.leave(options.backdrop);
    }
    $animate.leave(element);
    if (options.escapeToClose) {
      $rootElement.off('keyup', options.onKeyupRoot);
    }
    if (options.clickOutsideToClose) {
      $rootElement.off('click', options.onClickOutside);
    }
  };

  $sideService = $$interimElement({

    hasBackdrop: true,
    isolateScope: true,
    onShow: onShow,
    onRemove: onRemove,
    clickOutsideToClose: true,
    escapeToClose: true,
    targetEvent: null,
    transformTemplate: function(template) {
      return '<div class="side-content md-whiteframe-z2" layout="vertical" component="right">' + template + '</div>';
    }

  });

  return $sideService;

});
