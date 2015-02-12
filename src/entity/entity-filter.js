angular
.module('ngManager')
.filter('viewfilter', function ($filter) {
  return function (input, type, format) {

    if(typeof(input) === 'object'){
      input = JSON.stringify(input);
    }

    switch(type){
      case 'date':
        format = format || 'medium';
        return $filter('date')(input,format);

      // add custom type here
      // case 'foo': return var

      default:
        return input;
    }
  };
});