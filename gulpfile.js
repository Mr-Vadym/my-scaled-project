import gulp from "gulp";

const {src, dest, watch, series, parallel} = gulp;

import * as sass from "sass";
import gulpSass from "gulp-sass";

const scss = gulpSass(sass);

import concat from "gulp-concat";
import browserSync from "browser-sync";
import notify from "gulp-notify";
import webp from "gulp-webp";
import avif from "gulp-avif";
import autoprefixer from "gulp-autoprefixer";
import imagemin from "gulp-imagemin";
import cleanCSS from "gulp-clean-css";
import svgmin from "gulp-svgmin";
import rename from "gulp-rename";
import babel from "gulp-babel";
import sourcemaps from "gulp-sourcemaps";
import htmlmin from "gulp-htmlmin";
import terser from "gulp-terser";
import {deleteAsync as del} from "del";
import plumber from "gulp-plumber";
import fileInclude from "gulp-file-include";
import newer from "gulp-newer";
import gulpIf from "gulp-if";
import yargs from "yargs";
import {hideBin} from "yargs/helpers";

// imagemin plugins (явно)
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-pngquant";
import imageminGifsicle from "imagemin-gifsicle";
import imageminSvgo from "imagemin-svgo";

// -------------------------
// Режим збірки
// -------------------------
const argv = yargs(hideBin(process.argv)).boolean("prod").argv;
const isProd = argv.prod || process.env.NODE_ENV === "production";

const bs = browserSync.create();

// -------------------------
// Шляхи
// -------------------------
const paths = {
  styles: {
    // єдиний вхідний SCSS з імпортами
    entry: "src/scss/style.scss",
    watch: "src/scss/**/*.scss",
    dest: "dist/css",
  },
  scripts: {
    src: "src/js/**/*.js",
    dest: "dist/js",
  },
  html: {
    src: "src/html/**/*.html",
    // якщо є часткові інклуди в інших папках — додай тут
    dest: "dist",
  },
  images: {
    src: "src/assets/images/**/*.{png,jpg,jpeg,gif,svg}",
    dest: "dist/assets/images",
  },
  icons: {
    src: "src/assets/icons/**/*.svg",
    dest: "dist/assets/icons",
  },
  fonts: {
    src: "src/assets/fonts/**/*",
    dest: "dist/assets/fonts",
  },
  static: {
    // якщо треба копіювати інші файли (маніфест, favicons, тощо)
    src: "src/static/**/*",
    dest: "dist",
  },
};

// -------------------------
// Допоміжне
// -------------------------
function onError() {
  return plumber({
    errorHandler: notify.onError("Error: <%= error.message %>"),
  });
}

// -------------------------
// Очищення
// -------------------------
async function clean() {
  await del(["dist"]);
}

async function cleanImages() {
  await del([`${paths.images.dest}/**/*`, `!${paths.images.dest}`]);
}

// -------------------------
// HTML
// -------------------------
function html() {
  return src(paths.html.src)
    .pipe(onError())
    .pipe(
      fileInclude({
        prefix: "@@",
        basepath: "@file",
        context: {env: isProd ? "prod" : "dev"},
      })
    )
    .pipe(
      gulpIf(
        isProd,
        htmlmin({
          collapseWhitespace: true,
          removeComments: true,
          minifyCSS: true,
          minifyJS: true,
        })
      )
    )
    .pipe(dest(paths.html.dest))
    .pipe(bs.stream());
}

// -------------------------
// Styles
// -------------------------
function styles() {
  return src(paths.styles.entry, {sourcemaps: !isProd})
    .pipe(onError())
    .pipe(scss().on("error", scss.logError))
    .pipe(autoprefixer()) // таргети з Browserslist
    .pipe(gulpIf(isProd, cleanCSS({level: 2})))
    .pipe(
      gulpIf(
        isProd,
        rename({basename: "style", suffix: ".min"}),
        rename({basename: "style"})
      )
    )
    .pipe(dest(paths.styles.dest, {sourcemaps: !isProd ? "." : false}))
    .pipe(bs.stream());
}

// -------------------------
// Scripts
// -------------------------
function scripts() {
  return src("src/js/main.js", { sourcemaps: !isProd }) // лише головний вхід
    .pipe(onError())
    .pipe(
      babel({
        presets: [["@babel/preset-env", { targets: "defaults", modules: false }]],
        plugins: ["@babel/plugin-transform-runtime"]
      })
    )
    // без concat! ми не об'єднуємо модулі вручну
    .pipe(gulpIf(isProd, terser()))
    .pipe(rename(isProd ? "bundle.min.js" : "bundle.js"))
    .pipe(dest(paths.scripts.dest, { sourcemaps: !isProd ? "." : false }))
    .pipe(bs.stream());
}


// -------------------------
// Images
// -------------------------
function imagesOriginal() {
  return src(paths.images.src)
    .pipe(onError())
    .pipe(newer(paths.images.dest))
    .pipe(
      imagemin(
        [
          imageminMozjpeg({quality: 78}),
          imageminPngquant({quality: [0.65, 0.8]}),
          imageminGifsicle({optimizationLevel: 2}),
          imageminSvgo({
            plugins: [{name: "removeViewBox", active: false}],
          }),
        ],
        {verbose: false}
      )
    )
    .pipe(dest(paths.images.dest));
}

function imagesWebp() {
  return src(paths.images.src)
    .pipe(onError())
    .pipe(
      newer({
        dest: paths.images.dest,
        ext: ".webp",
      })
    )
    .pipe(webp())
    .pipe(dest(paths.images.dest));
}

function imagesAvif() {
  return src(paths.images.src)
    .pipe(onError())
    .pipe(
      newer({
        dest: paths.images.dest,
        ext: ".avif",
      })
    )
    .pipe(avif())
    .pipe(dest(paths.images.dest));
}

const images = parallel(imagesOriginal, imagesWebp, imagesAvif);

// -------------------------
// Icons (SVG)
// -------------------------
function icons() {
  return src(paths.icons.src)
    .pipe(onError())
    .pipe(newer(paths.icons.dest))
    .pipe(
      svgmin({
        plugins: [
          {name: "removeDimensions", active: true},
          {name: "removeViewBox", active: false},
        ],
      })
    )
    .pipe(dest(paths.icons.dest));
}

// -------------------------
// Fonts (без агресивного fontmin)
// -------------------------
function fonts() {
  return src(paths.fonts.src).pipe(onError()).pipe(newer(paths.fonts.dest)).pipe(dest(paths.fonts.dest));
}

// -------------------------
// Static (необовʼязково)
// -------------------------
function staticCopy() {
  return src(paths.static.src, {allowEmpty: true}).pipe(onError()).pipe(newer(paths.static.dest)).pipe(dest(paths.static.dest));
}

// -------------------------
// Dev Server + Watch
// -------------------------
function serve() {
  bs.init({
    server: {baseDir: "./dist"},
    open: false,
    notify: false,
  });

  watch(paths.styles.watch, styles);
  watch(paths.scripts.src, scripts);
  watch(paths.html.src, html);
  watch(paths.images.src, images);
  watch(paths.icons.src, icons);
  watch(paths.fonts.src, fonts);
  watch(paths.static.src, staticCopy);
}

// -------------------------
// Збірки
// -------------------------
const build = series(
  clean,
  // для прод-збірки можна розкоментувати cleanImages
  // cleanImages,
  parallel(html, styles, scripts, images, icons, fonts, staticCopy)
);

export {clean, html, styles, scripts, images, icons, fonts, staticCopy, serve as watch, build};

export default series(build, serve);
