const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const ttf2woff2 = require('gulp-ttf2woff2');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const gcmq = require('gulp-group-css-media-queries');
const cleanCss = require('gulp-clean-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const webp = require ('gulp-webp');
const webpHtml = require('gulp-webp-html');
const htmlMin = require('gulp-htmlmin');
const fileInclude = require('gulp-file-include');
const size = require('gulp-size');
const newer = require('gulp-newer');
const browserSync = require('browser-sync').create();
const del = require('del');

//path
const paths = {
    html: {
        src: 'src/**.html',
        dest: 'dist'
    },
    styles: {
        src: 'src/styles/**/*.scss',
        dest: 'dist/css/'
    },
    scripts: {
        src: 'src/scripts/**/*.js',
        dest: 'dist/js/'
    },
    images: {
        src: 'src/img/**',
        dest: 'dist/images/'
    },
    fonts: {
        src: 'src/fonts/**',
        dest: 'dist/fonts/'
    }
}

//deleting dist folder, delete all except images
function clean() {
    return del(['dist/*', '!dist/images'])
}

//template
function html() {
    return gulp.src(paths.html.src)
        .pipe(fileInclude())
        .pipe(htmlMin({collapseWhitespace: true}))
        .pipe(webpHtml())
        .pipe(size({
            showFiles: true
        }))
        .pipe(gulp.dest(paths.html.dest))
        .pipe(browserSync.stream());
}

//styles
function styles() {
    return gulp.src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(gcmq())
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(cleanCss({
            level: 2
        }))
        .pipe(rename({
            basename: 'main',
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(size({
            showFiles: true
        }))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.stream());
}

//scripts
function scripts() {
    return gulp.src(paths.scripts.src)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(size({
            showFiles: true
        }))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(browserSync.stream());
}

//images
function img() {
    return gulp.src(paths.images.src)
        .pipe(newer(paths.images.dest))
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(size({
            showFiles: true
        }))
        .pipe(gulp.dest(paths.images.dest))
        .pipe(newer(paths.images.dest))
        .pipe(webp())
        .pipe(gulp.dest(paths.images.dest))
        .pipe(size({
            showFiles: true
        }));
}

//fonts
function fonts() {
    return gulp.src(paths.fonts.src)
        .pipe(ttf2woff2())
        .pipe(gulp.dest(paths.fonts.dest))
        .pipe(size({
            showFiles: true
        }));
}

//watcher
function watch() {
    browserSync.init({
        server: {
            baseDir: './dist/'
        }
    })
    gulp.watch(paths.html.dest).on('change', browserSync.reload)
    gulp.watch(paths.html.src, html)
    gulp.watch(paths.styles.src, styles)
    gulp.watch(paths.scripts.src, scripts)
    gulp.watch(paths.images.src, img);
}

//build
exports.clean = clean;
exports.html = html;
exports.img = img;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;
exports.fonts = fonts;

exports.default = gulp.series(clean, html, gulp.parallel(styles, scripts, img), watch);
