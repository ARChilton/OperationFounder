var gulp = require('gulp');
var swPrecache = require('sw-precache');
var uglify = require('gulp-uglify');
var pump = require('pump');
var cleanCSS = require('gulp-clean-css');
var htmlmin = require('gulp-htmlmin');
var svgmin = require('gulp-svgmin');

gulp.task('generate-service-worker', function (callback) {
  var path = require('path');
  var swPrecache = require('sw-precache');
  var rootDir = 'dist';

  swPrecache.write(path.join(rootDir, 'sw.js'), {
    staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,svg,jpg,gif}'],
    stripPrefix: rootDir
  }, callback);
});
gulp.task('minify-service-worker', function (cb) {
  pump([
    gulp.src('dist/sw.js'),
    uglify(),
    gulp.dest('dist')
  ],
    cb
  );
});


gulp.task('minify-js', function (cb) {
  pump([
    gulp.src('www/**/*.js'),
    uglify(),
    gulp.dest('dist')
  ],
    cb
  );
});

gulp.task('minify-css', () => {
  return gulp.src('www/**/*.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest('dist'));
});

gulp.task('minify-html', function () {
  return gulp.src('www/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist'));
});

gulp.task('minify-svg', function () {
  return gulp.src('www/**/*.svg')
    .pipe(svgmin())
    .pipe(gulp.dest('dist'));
});

gulp.task('move-images', function () {
  return gulp.src('www/**/*.{png,jpeg,gif}')
    .pipe(gulp.dest('dist'));
});