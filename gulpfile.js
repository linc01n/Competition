var fs = require('fs');
var join = require('path').join;
var child = require('child_process');

var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require("vinyl-source-stream");

var sass = require('gulp-sass');
var browserify = require('browserify');
var browserSync = require('browser-sync');

var nodemon = require('gulp-nodemon');


///////////////////////////////////////////////////////////
// tasks

gulp.task('copyStaticFiles', function(){
  gulp.src('src/static/**')
    .pipe(gulp.dest('www'))
});

gulp.task('scss', function () {
  gulp.src('./src/scss/index.scss')
    .pipe(sass().on('error', gutil.log))
    .pipe(gulp.dest('www/css'));
});

var b = browserify();
b.transform('reactify'); // use the reactify transform
b.add('./src/jsx/index.jsx');
gulp.task('browserify', function(){
  b.bundle()
    .on('error', gutil.log)
    .pipe(source('index.js'))
    .pipe(gulp.dest('www/js'));
});

var reload = browserSync.reload;
gulp.task('browserSync', [], function(){
  browserSync({
    proxy: 'localhost:3000',
    port: 3001
  });
});

gulp.task('start', function () {
  nodemon({
    script: 'index.js',
    ext: 'js',
    watch: [],
    ignore: ['src/jsx/*'],
    "execMap": {
      "js": "iojs"
    }
  })
});

gulp.task('build', ['copyStaticFiles', 'scss', 'browserify']);

///////////////////////////////////////////////////////////


gulp.task('default', ['build', 'start', 'browserSync'], function(){

  // static
  gulp.watch('src/static/**', [ 'copyStaticFiles']);

  // scss
  gulp.watch('src/scss/**', ['scss']);

  // jsx
  gulp.watch(['src/jsx/**'], [ 'browserify' ]);



  // browser sync
  gulp.watch('www/css/**', function(event){
    if( event.type === 'deleted' ) reload();
    else reload(event.path);
  });
  gulp.watch(['www/js/**', 'src/routes/api.js']).on('change', reload);

});

