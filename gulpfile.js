var gulp = require('gulp');
var cache = require('gulp-cache')
var del = require('del')
var browserSync = require('browser-sync').create();
var runSequence = require('run-sequence');
var useref = require('gulp-useref');
var gulpIf = require('gulp-if');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

// Development Tasks
// -----------------
gulp.task('browserSync', function () {
  browserSync.init({
    server: {
      baseDir: 'app'
    }
  })
});

gulp.task('sass', function () {
  return gulp.src('app/assets/scss/+(main|ie9|ie8).scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError)) // Using gulp -sass
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/assets/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

// Watcher Tasks
// -------------
gulp.task('watch', ['browserSync', 'sass'], function () {
  gulp.watch('app/assets/scss/**/*.scss', ['sass']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/assets/js/**/*.js', browserSync.reload);
});

// Optimization Tasks
// ------------------

gulp.task('images', function () {
  return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
    .pipe(cache(imagemin({
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('favicon', function () {
  return gulp.src('app/*.ico')
    .pipe(gulp.dest('dist/'));
});

gulp.task('useref', function () {
  return gulp.src('app/*.html')
    .pipe(useref())
    // Minifies only if it's a JavaScript files'
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('dist'))
});

gulp.task('fonts', function () {
  return gulp.src('app/assets/fonts/**/*')
    .pipe(gulp.dest('dist/assets/fonts'))
})

// Cleaning Tasks
// --------------

gulp.task('cache:clear', function (callback) {
  return cache.clearAll(callback);
});

gulp.task('clean:dist', function () {
  return del.sync('dist');
});

// Build Sequences
// ---------------

gulp.task('default', function (callback) {
  runSequence('clean:dist', ['sass', 'useref','favicon', 'images', 'fonts'],
    callback
  )
});

gulp.task('start', function (callback) {
  runSequence(['sass', 'browserSync', 'watch'])
  callback
})