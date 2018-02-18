const gulp = require('gulp');
const swPrecache = require('sw-precache');
const uglify = require('gulp-uglify');
const pump = require('pump');
const cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const svgmin = require('gulp-svgmin');
const autoprefixer = require('gulp-autoprefixer');

gulp.task('generate-service-worker', function (callback) {
  const path = require('path');
  const swPrecache = require('sw-precache');
  const rootDir = 'dist';

  swPrecache.write(path.join(rootDir, 'sw.js'), {
    staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,svg,jpg,gif,woff2,woff,ttf,eot,otf}'],
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
  return gulp.src('www/css/*.css')
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cleanCSS({ compatibility: 'ie8', rebase: false }))
    .pipe(gulp.dest('dist/css'));
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

gulp.task('move-static', function () {
  return gulp.src('www/**/*.{png,jpeg,gif,woff2,woff,ttf,eot,otf}')
    .pipe(gulp.dest('dist'));
});

gulp.task('onsenui', function () {
  return gulp.src('www/lib/onsenui/css/{font_awesome,ionicons,material-design-iconic-font}/**/*.*')
    .pipe(gulp.dest('dist/lib/onsenui/css'));
});

gulp.task('minify-onsenui-css', function () {
  return gulp.src('www/lib/onsenui/css/*.css')
    .pipe(gulp.dest('dist/lib/onsenui/css'));
});
