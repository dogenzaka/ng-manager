/*! angular-base64-upload - v0.0.5 - 2015-03-08
* https://github.com/adonespitogo/angular-base64-upload
* Copyright (c) Adones Pitogo <pitogo.adones@gmail.com> 2015; Licensed  */
angular.module('naif.base64', [])
.directive('baseSixtyFourInput', ['$window', function ($window) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elem, attrs, ngModel) {

      var arrayBufferToBase64 = function(buffer) {
        var binary = '';
        var bytes = new Uint8Array( buffer );
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
        }
        return $window.btoa( binary );
      };

      var fileObject = {};

      scope.readerOnload = function(e){
        fileObject.base64 = arrayBufferToBase64(e.target.result);
        scope.$apply(function(){
          ngModel.$setViewValue(angular.copy(fileObject));
        });
      };

      var reader = new FileReader();
      reader.onload = scope.readerOnload;

      elem.on('change', function() {
        var file = elem[0].files[0];

        if (file) {
          fileObject.filetype = file.type;
          fileObject.filename = file.name;
          fileObject.filesize = file.size;
          reader.readAsArrayBuffer(file);
        } else {
          fileObject.filetype = "";
          fileObject.filename = "";
          fileObject.filesize = "";
          fileObject.base64 = "";
          ngModel.$setViewValue(angular.copy(fileObject));
        }
      });

    }
  };
}]);
