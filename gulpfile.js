/*eslint-env node*/
const gulp = require('gulp');
const runSequence = require('run-sequence');
const del = require('del');
const swPrecache = require('sw-precache');
const path = require('path');
const uglify = require('gulp-uglify-es').default;
const pump = require('pump');
const cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const svgmin = require('gulp-svgmin');
const autoprefixer = require('gulp-autoprefixer');
const sitemap = require('gulp-sitemap');

const buildFolder = 'dist';

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
    cb
  );
});

gulp.task('build-clean', () => del([buildFolder]));

gulp.task('generate-service-worker', (callback) => {

  const rootDir = buildFolder;

  swPrecache.write(path.join(rootDir, 'sw.js'), {
    staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,svg,jpg,gif,woff2,woff,ttf,eot,otf}'],
    stripPrefix: rootDir
  }, callback);
});

gulp.task('minify-service-worker', (cb) => {
  pump(
    [
      gulp.src(`${buildFolder}/sw.js`),
      uglify(),
      gulp.dest(buildFolder)
    ],
    cb
  );
});


gulp.task('minify-js', (cb) => {
  pump(
    [
      gulp.src('www/**/*.js'),
      uglify({ compress: { drop_console: true } }),
      gulp.dest(buildFolder)
    ],
    cb
  );
});

gulp.task('minify-css', () => gulp.src('www/**/*.css')
  .pipe(autoprefixer({
    browsers: ['last 2 versions'],
    cascade: false
  }))
  .pipe(cleanCSS({
    compatibility: 'ie8',
    level: {
      1: {
        all: true,
        normalizeUrls: true
      }
    },
    rebase: false

  }))
  .pipe(gulp.dest(buildFolder)));

gulp.task('minify-html', () => gulp.src('www/**/*.html')
  .pipe(htmlmin({
    collapseWhitespace: true,
    minifyJS: true,
    removeComments: true
  }))
  .pipe(gulp.dest(buildFolder)));

gulp.task('minify-svg', () => gulp.src('www/**/*.svg')
  .pipe(svgmin())
  .pipe(gulp.dest(buildFolder)));

gulp.task('move-static', () => gulp.src('www/**/*.{png,jpeg,gif,woff2,woff,ttf,eot,otf,xml,webmanifest,ico,md}')
  .pipe(gulp.dest(buildFolder)));

gulp.task('minify-onsenui-css', () => gulp.src('www/lib/onsenui/css/*.css')
  .pipe(cleanCSS({
    level: {
      1: {
        all: true,
        normalizeUrls: false
      }
    }
  }))
  .pipe(gulp.dest(`${buildFolder}/lib/onsenui/css`)));

gulp.task('delete-monaca-components', () => del([`${buildFolder}/components`]));

gulp.task('move-license', () => {
  gulp.src('license.txt')
    .pipe(gulp.dest(buildFolder));
});

gulp.task('sitemap', () => gulp.src('www/**/*.html', { read: false })
  .pipe(sitemap({
    siteUrl: 'https://checkpointlive.com'
  }))
  .pipe(gulp.dest(buildFolder)));