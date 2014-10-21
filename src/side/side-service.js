angular
.module('ngManager')
.service('$sideContent', function($rootElement, $$interimElement, $animate) {

  var onShow = function(scope, element, options) {

    // Always wrapping jqlite like mdDialog
    options.parent = angular.element(options.parent);

    console.log("ONSHOW");
    var backdrop = angular.element('<md-backdrop class="opaque ng-enter">');
    $animate.enter(backdrop, options.parent, null);
    options.backdrop = backdrop;
  };

  var onRemove = function(scope, element, options) {
    console.log("ONREMOVE");
    if (options.backdrop) {
      $animate.leave(options.backdrop);
    }
    if (options.escapeToClose) {
      $rootElement.off('keyup', options.rootElementKeyupCallback);
    }
    if (options.clickOutsideToClose) {
      element.off('click', options.dialogClickOutsideCallback);
    }
  };

  var $sideService = $$interimElement({

    hasBackdrop: true,
    isolateScope: true,
    onShow: onShow,
    onRemove: onRemove,
    clickOutsideToClose: true,
    escapeToClose: true,
    targetEvent: null,
    transformTemplate: function(template) {
      return '<md-sidenav class="md-sidenav-right md-white-frame-z2" layout="vertical" component="right">' + template + '</div>';
    }
  });

  return $sideService;

});
