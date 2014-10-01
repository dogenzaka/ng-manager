angular
.module('ngManager')
.config(function($translateLoaderProvider) {

  console.info('i18n: en');
  $translateLoaderProvider.translations('en', {
    name: 'Name',
    url: 'URL'
  });

})
;
