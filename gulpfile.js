import gulp from "gulp";
const { src, watch, series, parallel } = gulp;
import * as sass from "sass";
import gulpSass from "gulp-sass";
const scss = gulpSass(sass);
import concat from "gulp-concat";
import browserSync from "browser-sync";
import notify from "gulp-notify";
import fontmin from "gulp-fontmin";
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
import purgecss from "gulp-purgecss";
import { stream as critical } from "critical";
import { deleteAsync as del } from "del";
import plumber from "gulp-plumber";
import fileInclude from "gulp-file-include";
import newer from "gulp-newer";

const paths = {
  styles: {
    src: "src/scss/**/*.scss",
    dest: "dist/css",
  },
  scripts: {
    src: "src/js/**/*.js",
    dest: "dist/js",
  },
  html: {
    src: "src/html/**/*.html",
    dest: "dist",
  },
  images: {
    src: "src/assets/images/**/*",
    dest: "dist/assets/images",
  },
  icons: {
    src: "src/assets/icons/**/*",
    dest: "dist/assets/icons",
  },
  fonts: {
    src: "src/assets/fonts/**/*",
    dest: "dist/assets/fonts",
  },
};

async function clean() {
  await del(["dist"]);
}

function styles() {
  return src(paths.styles.src)
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(sourcemaps.init())
    .pipe(scss().on("error", scss.logError))
    .pipe(autoprefixer({ overrideBrowserslist: ["last 2 versions", "ie 11"] }))
    .pipe(cleanCSS())
    .pipe(concat("style.min.css"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

function scripts() {
  return src(paths.scripts.src)
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(terser())
    .pipe(concat("bundle.min.js"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

function html() {
  return src(paths.html.src)
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(fileInclude({ prefix: "@@", basepath: "@file" }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream());
}

function webpImage(done) {
  src(paths.images.src)
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(imagemin())
    .pipe(webp())
    .pipe(gulp.dest(paths.images.dest));
  done();
}

function avifImage(done) {
  src(paths.images.src)
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(imagemin())
    .pipe(avif())
    .pipe(gulp.dest(paths.images.dest));
  done();
}

function images(done) {
  cleanImages(() => {
    parallel(webpImage, avifImage)(done);
  });
}

function cleanImages(done) {
  del([`${paths.images.dest}/**/*`, `!${paths.images.dest}`]).then(() => done());
}

function icons(done) {
  src(paths.icons.src)
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(svgmin())
    .pipe(gulp.dest(paths.icons.dest));
  done();
}

function fonts(done) {
  src(paths.fonts.src)
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(fontmin())
    .pipe(gulp.dest(paths.fonts.dest));
  done();
}

function watchFiles(done) {
  browserSync.init({
    server: {
      baseDir: "./dist",
    },
  });

  watch(paths.styles.src, styles);
  watch(paths.scripts.src, scripts);
  watch(paths.html.src, html);
  watch(paths.images.src, images);
  watch(paths.icons.src, icons);
  watch(paths.fonts.src, fonts);

  // Повідомляємо Gulp, що задача завершена (хоча вона триває)
  done();
}

const build = series(
  clean,
  parallel(styles, scripts, html, images, icons, fonts)
);

export { clean, styles, scripts, html, images, icons, fonts, watchFiles as watch, build };

export default series(build, watchFiles);
