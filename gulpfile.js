"use strict";

const browserify = require("browserify");
const gulp = require("gulp");
const uglify = require("gulp-uglify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const sourcemaps = require("gulp-sourcemaps");
const gutil = require("gulp-util");
const babel = require("gulp-babel");
const babelify = require("babelify");


gulp.task("module", function () {
    browserify("src/feedme.js", { debug: true })
        .transform(babelify.configure(
            {
                presets: ["latest"],
                compact: true
            }
        ))
        .bundle()
        .on("error", gutil.log)
        .pipe(source("feedme.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("compiled/"));
});

gulp.task("default", ["module"]);
