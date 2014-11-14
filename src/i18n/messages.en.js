angular
.module('ngManager')
.config(function($translateLoaderProvider) {

  $translateLoaderProvider.translations('en', {
    name: 'Name',
    url: 'URL'
  });

})
;
