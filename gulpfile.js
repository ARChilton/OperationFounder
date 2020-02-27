/*eslint-env node*/
const { series, parallel, src, dest } = require('gulp')
// const runSequence = require("run-sequence");
const del = require('del')
const swPrecache = require('sw-precache')
const path = require('path')
const uglify = require('gulp-uglify-es').default
const pump = require('pump')
const cleanCSS = require('gulp-clean-css')
const htmlmin = require('gulp-htmlmin')
const svgmin = require('gulp-svgmin')
const autoprefixer = require('gulp-autoprefixer')
const sitemap = require('gulp-sitemap')

const buildFolder = 'dist'

const buildClean = () => del([buildFolder])

const generateServiceWorker = callback => {
  const rootDir = buildFolder

  swPrecache.write(
    path.join(rootDir, 'sw.js'),
    {
      staticFileGlobs: [
        rootDir +
          '/**/!(404*).{js,html,css,png,svg,jpg,gif,woff2,woff,ttf,eot,otf}'
      ],
      // staticFileGlobs: [rootDir + '*/*!(404**)/**/*.{js,html,css,png,svg,jpg,gif,woff2,woff,ttf,eot,otf}'],
      stripPrefix: rootDir
    },
    callback
  )
}

const minifyServiceWorker = cb => {
  pump([src(`${buildFolder}/sw.js`), uglify(), dest(buildFolder)], cb)
}

const minifyJs = cb => {
  pump(
    [
      src('www/**/*.js'),
      uglify({ compress: { drop_console: true } }),
      dest(buildFolder)
    ],
    cb
  )
}

const minifyCSS = () =>
  src('www/**/*.css')
    .pipe(
      autoprefixer({
        browserList: ['last 2 versions'],
        cascade: false
      })
    )
    .pipe(
      cleanCSS({
        compatibility: 'ie8',
        level: {
          1: {
            all: true,
            normalizeUrls: true
          }
        },
        rebase: false
      })
    )
    .pipe(dest(buildFolder))

const minifyHtml = () =>
  src('www/**/*.html')
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        minifyJS: true,
        removeComments: true
      })
    )
    .pipe(dest(buildFolder))

const minifySvg = () =>
  src('www/**/*.svg')
    .pipe(svgmin())
    .pipe(dest(buildFolder))
const moveStatic = () =>
  src(
    'www/**/*.{png,jpeg,gif,woff2,woff,ttf,eot,otf,xml,webmanifest,ico,md,txt}'
  ).pipe(dest(buildFolder))

const minifyOnsenuiCss = () =>
  src('www/lib/onsenui/css/*.css')
    .pipe(
      cleanCSS({
        level: {
          1: {
            all: true,
            normalizeUrls: false
          }
        }
      })
    )
    .pipe(dest(`${buildFolder}/lib/onsenui/css`))
const deleteMonacaComponents = () => del([`${buildFolder}/components`])

const moveLicense = () => src('license.txt').pipe(dest(buildFolder))

const sitemapGenerator = () =>
  src('www/**/*.html', { read: false })
    .pipe(
      sitemap({
        siteUrl: 'https://checkpointlive.com'
      })
    )
    .pipe(dest(buildFolder))

exports.build = series(
  buildClean,
  parallel(
    minifyJs,
    minifyCSS,
    minifySvg,
    minifyHtml,
    moveStatic,
    moveLicense,
    deleteMonacaComponents
  ),
  sitemapGenerator,
  generateServiceWorker,
  minifyServiceWorker
)
