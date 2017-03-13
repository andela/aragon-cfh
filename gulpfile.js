const gulp = require('gulp');
const jade = require('gulp-jade');
const sass = require('gulp-sass');
const eslint = require('gulp-eslint');
const bower = require('gulp-bower');
const nodemon = require('gulp-nodemon');
const mocha = require('gulp-mocha');
const browserSync = require('browser-sync');
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./package.json'));

gulp.task('watch', () => {
  gulp.watch('app/views/**', ['jade']);
  gulp.watch('public/views/**', browserSync.reload());
  gulp.watch('public/css/common.scss', ['sass']);
  gulp.watch('public/css/**', browserSync.reload());
  gulp.watch(['public/js/**', 'app/**/*.js'], browserSync.reload());
});

gulp.task('jade', () => {
  return gulp.src('app/views/**/*.jade')
    .pipe(jade())
    .pipe(gulp.dest('public/views'));
});

gulp.task('sass', () => {
  gulp.src('public/css/common.scss')
    .pipe(sass())
    .pipe(gulp.dest('public/css/'));
});

gulp.task('eslint', () => {
  gulp.src([
    'gruntfile.js',
    'public/js/**/*.js',
    'test/**/*.js',
    'app/**/*.js'
  ])
    .pipe(eslint());
});

gulp.task('nodemon', () => {
  nodemon({
    script: 'server.js',
    ext: 'js',
    ignore: ['node_modules/**/*.js'],
    watch: ['app', 'config'],
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
    }
  });
});

gulp.task('serve', ['nodemon'], () => {
  browserSync();
});

gulp.task('mochaTest', () => {
  gulp.src('test/**/*.js')
    .pipe(mocha({
      reporter: 'spec',
    }));
});

gulp.task('bower', () => {
  bower()
    .pipe(gulp.dest('./public/lib/'));
});

gulp.task('test', ['mochaTest']);

gulp.task('default', ['eslint', 'serve', 'watch', 'jade', 'sass', 'test']);

gulp.task('install', ['bower']);