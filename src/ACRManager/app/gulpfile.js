var gulp = require("gulp");
var clean = require("gulp-clean");

var destPath = "../wwwroot/libs/";
var exec = require("child_process").exec;

gulp.task("clean", function () {
    return gulp.src("../wwwroot/*")
        .pipe(clean());
});

gulp.task("scripts", () => {
    gulp.src([
            "react/dist/**",
            "react-dom/dist/**"
    ], {
        cwd: "./node_modules/**"
    }).pipe(gulp.dest("../wwwroot/scripts/"));
});

gulp.task("static", function () {
    return gulp.src("../static/**").pipe(gulp.dest("../wwwroot/"));
});

gulp.task("webpack", function (done) {
    return exec("webpack", function (err, stdout, stderr) {
        gulp.src("./dist/*").pipe(gulp.dest("../wwwroot/app/dist/"));
        console.log(stdout);
        done(err);
    });
});

gulp.task("watch", ["watch.app", "watch.static"]);

gulp.task("watch.app", ["webpack"], function () {
    return gulp.watch("./src/**/*", ["webpack"]);
});

gulp.task("watch.static", ["static"], function () {
    return gulp.watch("../static/**/*", ["static"]);
});

gulp.task("default", ["scripts", "watch"]);