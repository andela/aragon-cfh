const gulp = require('gulp');
const sass = require('gulp-sass');
const eslint = require('gulp-eslint');
const bower = require('gulp-bower');
const nodemon = require('gulp-nodemon');
const mocha = require('gulp-mocha');
const browserSync = require('browser-sync');

// add travis ci task
gulp.task('travis', ['mochaTest'], () => {
  process.exit(0);
});

gulp.task('watch', () => {
  gulp.watch('app/views/**', browserSync.reload());
  gulp.watch('public/views/**', browserSync.reload());
  gulp.watch('public/css/common.scss', ['sass']);
  gulp.watch('public/css/**', browserSync.reload());
  gulp.watch(['public/js/**', 'app/**/*.js'], browserSync.reload());
});

gulp.task('sass', () => {
  gulp.src('public/css/common.scss')
    .pipe(sass())
    .pipe(gulp.dest('public/css/'));
});

gulp.task('eslint', () => {
  gulp.src([
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
      PORT: 4000,
    }
  });
});

gulp.task('serve', ['nodemon'], () => {
  browserSync({
    proxy: 'localhost:5000',
    files: ['public/**/*.*'],
    port: 5000,
    open: false,
  });
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

gulp.task('default', ['eslint', 'nodemon', 'serve', 'watch', 'sass']);

gulp.task('install', ['bower']);
