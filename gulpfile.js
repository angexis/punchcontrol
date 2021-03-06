const gulp = require('gulp');
const print = require('gulp-print').default;
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const svgmin = require('gulp-svgmin');
const svgstore = require('gulp-svgstore');
const cheerio = require('gulp-cheerio');
const del = require('del');
const sass = require('gulp-sass');
const fs = require('fs');
// const favicons = require("gulp-favicons");
const path = require('path');
// ====================================
// Super-tasks
// ====================================
gulp.task('prepare', ['svg', 'themes']);
gulp.task('clean', ['clean:svg', 'clean:partials']);
gulp.task('watch', ['watch:svg', 'watch:themes']);

// ====================================
// Utility functions
// ====================================
function logchange(event) {
    gutil.log('... ' + event.path + ' was ' + event.type)
};

// ====================================
// SVGs
// /!\ When saving in Inkscape make sure
//     that it generates a viewBox attribute
//     => w/o viewBox it will not work!!!
// ====================================
const SVG_SRC_PATH = 'design/svg/**/*.svg';
const SVG_DEST_PATH = 'client/src/assets/gen';
gulp.task('svg', function () {
    return gulp
        .src(SVG_SRC_PATH)
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[style]').removeAttr('style');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(rename(function (path) {
            if (path.dirname !== '.') {
                let name = path.dirname.split(path.sep);
                name.push(path.basename);
                path.basename = name.join('-');
            }
        }))
        .pipe(svgmin())
        .pipe(svgstore({ inlineSvg: true }))
        .pipe(gulp.dest(SVG_DEST_PATH))
        .pipe(print());
});
gulp.task('watch:svg', ['svg'], function () {
    const w = gulp.watch(SVG_SRC_PATH, ['svg']);
    w.on('change', logchange);
    return w;
});
gulp.task('clean:svg', function () {
    return del([
        SVG_DEST_PATH
    ]);
});

// gulp.task("favicon", function () {
//     return gulp.src("design/svg/logo.svg").pipe(favicons({
//         appName: "Punchcontrol",
//         display: "standalone",
//         orientation: "portrait",
//         start_url: "/?homescreen=1",
//         version: 1.0,
//         logging: false,
//         online: false,
//         html: "index.html",
//         pipeHTML: true,
//         replace: true
//     }))
//     .on("error", gutil.log)
//     .pipe(gulp.dest("./_favicon"));
// });

// THEMES
const es = require('event-stream')
const THEMES_SRC_PATH = 'client/src/themes';
const THEMES_DEST_PATH = 'client/src/assets/gen';
const THEMES_PARTIALS = 'client/src/app/**/_*.theme.scss';
const THEMES_GEN_PARTIALS = `${THEMES_SRC_PATH}/gen/_partials.scss`;

// This task generates a list of all partials files spread over the app
// this generated patial will be imported by the themes.
gulp.task('partials', function (done) {
    gulp.src(THEMES_PARTIALS)
        .pipe(es.map(function (file, cb) {
            const parsedPath = path.parse(file.path);
            const relFolder = path.relative(__dirname, parsedPath.dir);
            const name = parsedPath.name.slice(1);
            gutil.log(`Found ${relFolder}/${name}`);
            return cb(null, `@import '${relFolder}/${name}';\n`);
        }))
        .pipe(fs.createWriteStream(THEMES_GEN_PARTIALS))
        .on('finish', function () {
            gutil.log(`Created ${THEMES_GEN_PARTIALS}`);
            done();
        });
});
gulp.task('clean:partials', () => {
    return del([THEMES_GEN_PARTIALS]);
});
gulp.task('themes', ['partials'], function () {
    return gulp.src(`${THEMES_SRC_PATH}/theme-*.scss`)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(THEMES_DEST_PATH))
        .pipe(print());
});
gulp.task('watch:themes', ['themes'], () => {
    const w = gulp.watch([THEMES_PARTIALS, `${THEMES_SRC_PATH}/**`], ['themes']);
    w.on('change', logchange);
    return w;
});
