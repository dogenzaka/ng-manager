var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var annotate = require('gulp-ng-annotate');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var cssmin = require('gulp-cssmin');
var sourcemaps = require('gulp-sourcemaps');

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
    'bower_components/angular-loading-bar/build/loading-bar.js',
    'bower_components/hammerjs/hammer.js',
    'bower_components/lodash/dist/lodash.compat.js',
    'bower_components/tv4/tv4.js'
  ])
  .pipe(sourcemaps.init())
  .pipe(concat('components.js'))
  //.pipe(uglify())
  .pipe(sourcemaps.write('maps/'))
  .pipe(gulp.dest('app/js/'))
  ;

  gulp
  .src([
    'bower_components/angular-material/angular-material.css',
    'bower_components/angular-loading-bar/build/loading-bar.css'
  ])
  .pipe(concat('components.css'))
  .pipe(cssmin())
  .pipe(gulp.dest('./app/css'))
  ;

});

// Convert jade adn stylus files
gulp.task('templates', function() {

  gulp
  .src('./templates/stylus/**/*.styl')
  .pipe(stylus())
  .pipe(concat('main.css'))
  .pipe(gulp.dest('./app/css'))
  ;

  gulp
  .src('./templates/jade/**/*.jade')
  .pipe(jade())
  .pipe(gulp.dest('./app'))
  ;

});

// Concat and compress main scripts
gulp.task('scripts', function() {

  gulp
  .src([
    './src/main.js',
    './src/**/*.js'
  ])
  .pipe(sourcemaps.init())
  .pipe(concat('main.js'))
  .pipe(annotate())
  //.pipe(uglify())
  .pipe(sourcemaps.write('maps/'))
  .pipe(gulp.dest('app/js/'))
  ;

});

// Launch the server
gulp.task('server', ['components','templates','scripts'], function() {

  gulp.watch('templates/**/*', ['templates']);
  gulp.watch('components.*', ['components']);
  gulp.watch('src/**/*', ['scripts']);
  require('./example/app.js').listen(4000, function() {
    console.log("Server listening port on 4000");
  });

});

gulp.task('default', ['server']);
