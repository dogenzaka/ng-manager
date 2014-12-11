var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var annotate = require('gulp-ng-annotate');
var templateCache = require('gulp-angular-templatecache');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var cssmin = require('gulp-cssmin');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');

// Concatnate 3rd party modules with duo
gulp.task('components', function() {

  gulp
  .src([
    'bower_components/angular/angular.js',
    'bower_components/angular-animate/angular-animate.js',
    'bower_components/angular-material/angular-material.js',
    'bower_components/angular-route/angular-route.js',
    'bower_components/angular-aria/angular-aria.js',
    'bower_components/angular-translate/angular-translate.js',
    'bower_components/hammerjs/hammer.js',
    'bower_components/lodash/dist/lodash.compat.js',
    'bower_components/tv4/tv4.js',
    'bower_components/ngInfiniteScroll/build/ng-infinite-scroll.min.js'
  ])
  .pipe(sourcemaps.init())
  .pipe(concat('components.js'))
  .pipe(uglify())
  .pipe(sourcemaps.write('maps/'))
  .pipe(gulp.dest('app/js/'))
  ;

  gulp
  .src([
    'bower_components/angular-material/angular-material.css'
    ,'bower_components/angular-material/themes/blue-theme.css'
    ,'bower_components/angular-material/themes/blue-grey-theme.css'
    ,'bower_components/angular-material/themes/brown-theme.css'
    ,'bower_components/angular-material/themes/cyan-theme.css'
    ,'bower_components/angular-material/themes/deep-purple-theme.css'
    ,'bower_components/angular-material/themes/deep-orange-theme.css'
    ,'bower_components/angular-material/themes/indigo-theme.css'
    ,'bower_components/angular-material/themes/green-theme.css'
    ,'bower_components/angular-material/themes/grey-theme.css'
    ,'bower_components/angular-material/themes/teal-theme.css'
    ,'bower_components/angular-material/themes/orange-theme.css'
    ,'bower_components/angular-material/themes/red-theme.css'
  ,
  ])
  .pipe(concat('components.css'))
  .pipe(cssmin())
  .pipe(gulp.dest('./app/css'))
  ;

});

// Convert jade adn stylus files
gulp.task('stylus', function() {

  gulp
  .src([
    './templates/stylus/main.styl'
  ])
  .pipe(plumber())
  .pipe(stylus({
    compress: true
  }))
  .pipe(gulp.dest('app/css'))
  ;

});

gulp.task('jade', function() {

  gulp
  .src('./templates/jade/index.jade')
  .pipe(plumber())
  .pipe(jade())
  .pipe(gulp.dest('app/'))
  ;

  gulp
  .src('./templates/jade/template/**/*.jade')
  .pipe(plumber())
  .pipe(jade())
  .pipe(templateCache({
    module: 'ngManager'
  }))
  .pipe(gulp.dest('app/js/'))
  ;

});

// Concat and compress main scripts
gulp.task('scripts', function() {

  gulp
  .src([
    './src/main.js',
    './src/**/*.js'
  ])
  .pipe(plumber())
  .pipe(sourcemaps.init())
  .pipe(concat('main.js'))
  .pipe(annotate())
  .pipe(uglify())
  .pipe(sourcemaps.write('maps/'))
  .pipe(gulp.dest('app/js/'))
  ;

});

gulp.task('fonts', function() {

  gulp
  .src([
    './fonts/**/*'
  ])
  .pipe(gulp.dest('app/fonts/'))
  ;

});

// Launch the server
gulp.task('server', ['components','stylus','jade','fonts','scripts'], function() {

  gulp.watch('templates/stylus/**/*', ['stylus']);
  gulp.watch('templates/jade/**/*', ['jade']);
  gulp.watch('components.*', ['components']);
  gulp.watch('src/**/*', ['scripts']);
  require('./example/app.js').listen(4000, function() {
    console.log("Server listening port on 4000");
  });

});

gulp.task('default', ['server']);
