const gulp = require('gulp');
const runSequence = require('run-sequence');
const del = require('del');
const swPrecache = require('sw-precache');
const uglify = require('gulp-uglify');
const pump = require('pump');
const cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const svgmin = require('gulp-svgmin');
const autoprefixer = require('gulp-autoprefixer');

const buildFolder = 'dist'

gulp.task('build', (cb) => {
  runSequence(
    'build-clean',
    'minify-js',
    'minify-css',
    'minify-svg',
    'minify-html',
    'move-static',
    'move-license',
    'delete-monaca-components',
    'generate-service-worker',
    'minify-service-worker',
    cb);
});

gulp.task('build-clean', () => {
  return del([buildFolder]);
});

gulp.task('generate-service-worker', (callback) => {
  const path = require('path');
  const swPrecache = require('sw-precache');
  const rootDir = buildFolder;

  swPrecache.write(path.join(rootDir, 'sw.js'), {
    staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,svg,jpg,gif,woff2,woff,ttf,eot,otf}'],
    stripPrefix: rootDir
  }, callback);
});

gulp.task('minify-service-worker', (cb) => {
  pump([
    gulp.src(`${buildFolder}/sw.js`),
    uglify(),
    gulp.dest(buildFolder)
  ],
    cb
  );
});


gulp.task('minify-js', (cb) => {
  pump([
    gulp.src('www/**/*.js'),
    uglify({ compress: { drop_console: true } }),
    gulp.dest(buildFolder)
  ],
    cb
  );
});

gulp.task('minify-css', () => {
  return gulp.src('www/**/*.css')
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cleanCSS({
      compatibility: 'ie8',
      level: {
        1: {
          all: true,
          normalizeUrls: true,
        }
      },
      rebase: false,

    }))
    .pipe(gulp.dest(buildFolder));
});

gulp.task('minify-html', () => {
  return gulp.src('www/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      minifyJS: true,
      removeComments: true
    }))
    .pipe(gulp.dest(buildFolder));
});

gulp.task('minify-svg', () => {
  return gulp.src('www/**/*.svg')
    .pipe(svgmin())
    .pipe(gulp.dest(buildFolder));
});

gulp.task('move-static', () => {
  return gulp.src('www/**/*.{png,jpeg,gif,woff2,woff,ttf,eot,otf,xml,webmanifest,ico,md}')
    .pipe(gulp.dest(buildFolder));
});


gulp.task('minify-onsenui-css', () => {
  return gulp.src('www/lib/onsenui/css/*.css')
    .pipe(cleanCSS({
      level: {
        1: {
          all: true,
          normalizeUrls: false,
        }
      }
    }))
    .pipe(gulp.dest(`${buildFolder}/lib/onsenui/css`));
});

gulp.task('delete-monaca-components', () => {
  return del([`${buildFolder}/components`]);
});

gulp.task('move-license', () => {
  gulp.src('license.txt')
    .pipe(gulp.dest(buildFolder));
});