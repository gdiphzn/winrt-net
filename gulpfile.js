var gulp = require('gulp');
var babel = require('gulp-babel');
var shell = require('gulp-shell');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');

gulp.task('bundle-demo-deps', shell.task([
    'jspm bundle events + buffer + stream demo/demo-bundle-dependencies.js'
]))



var libSource = 'src/net.js';
gulp.task('build-lib', () => {
    return gulp.src(libSource)
        .pipe(plumber())
        .pipe(changed('lib'))
        .pipe(babel({
            plugins: ['transform-es2015-modules-commonjs', 'transform-class-properties'],
            presets: ['es2015']
        }))
        .pipe(gulp.dest('lib'));
});
gulp.task('watch-lib', ['build-lib'], function() {
    gulp.watch(libSource, ['build-lib']);
});

var demoSource = 'src/**/*.js';
gulp.task('build-demo', () => {
    return gulp.src(demoSource)
        .pipe(plumber())
        .pipe(changed('demo'))
        .pipe(babel({
            plugins: ['transform-es2015-modules-systemjs', 'transform-class-properties'],
            presets: ['es2015']
        }))
        .pipe(gulp.dest('demo'));
});
gulp.task('watch-demo', ['build-demo'], function() {
    gulp.watch(demoSource, ['build-demo']);
});


gulp.task('default', ['bundle-demo-deps', 'build-demo', 'build-lib']);
gulp.task('dev', ['watch-demo', 'watch-lib']);
gulp.task('demo', ['bundle-demo-deps', 'build-demo']);