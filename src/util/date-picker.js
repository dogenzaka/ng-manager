(function() {
  'use strict';

  var app;

  app = angular.module('datePicker', ['ngMaterial', 'ui.utils']);

  app.directive('mdDatePicker', [    
    '$datepicker', function($datepicker) {      
      return {
        template: '<div class="md-toolbar-tools dark">' + ' <md-input-container ng-disabled="isDisabled">' + '     <label>{{label}}</label>' + '    <input data-date-format="yyyy-MM-dd" id="date-picker" model-view-value="true"' + '             ng-model="value" bs-datepicker></md-input>' + '</md-input-container>' + '</div>',
        restrict: 'E',
        scope: {
          lineColor: "@",
          textColor: "@",
          mask: "@"
        },
        link: function(scope, element, attrs) {
          var picker;
          picker = $("#date-picker");
          if (scope.textColor) {
            picker.css("color", scope.textColor, "important");
          }
          if (scope.lineColor) {
            picker.css("border-color", scope.lineColor, "important");
          }
        }
      };
    }
  ]);

}).call(this);
