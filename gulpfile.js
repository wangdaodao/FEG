/*
使用原始
npm config set registry = "https://registry.npmjs.org/"
使用淘宝
npm config set registry = "https://registry.npm.taobao.org/"

npm install gulp node-sass gulp-sass gulp-autoprefixer gulp-minify-css gulp-livereload gulp-uglify gulp-webserver gulp-concat gulp-clean gulp-zip gulp-plumber opn --save-dev
*/
var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss    = require('gulp-minify-css'),
    livereload   = require('gulp-livereload'),
    uglify       = require('gulp-uglify'),
    webserver    = require('gulp-webserver'),
    concat       = require('gulp-concat'),
    clean        = require('gulp-clean'),
    zip          = require('gulp-zip'),
    plumber      = require('gulp-plumber'),
    opn          = require('opn');

//配置本地Web 服务器：主机+端口
var localserver = {
  host: 'localhost',
  port: '8080'
}

//删除js文件
gulp.task('cleanjs', function () {
  var stream = gulp.src('./js/all.js')
    .pipe(clean());
  return stream;
});

//合并javascript文件，合并后文件放入js下按顺序压缩gulp.src(['a.js', 'b.js', 'c.js'])
gulp.task('alljs',['cleanjs'],function(){
  return gulp.src('./js/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./js'));
});

//压缩css文件
gulp.task('styles', function() {
  return gulp.src('./css/main.scss')
    .pipe(plumber())
    .pipe(sass({outputStyle:'compact'}).on('error', sass.logError))
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest('./css'));
});

//文件监控
gulp.task('watch', function () {
  // Watch .scss files
  gulp.watch('./css/*.scss', ['styles']);
  // Watch .js files
  gulp.watch('./js/*.js', ['alljs']);
});

//调试监控
gulp.task('debugwatch', function () {
  // Create LiveReload server
  livereload.listen();
  // Watch any files, reload on change
  gulp.watch(['./css/*.css','./js/*.js','*.html'],function(file){
    livereload.changed(file.path);
  });
});

//开启本地 Web 服务器功能
gulp.task('webserver', function() {
  gulp.src( './' )
    .pipe(webserver({
      host:             localserver.host,
      port:             localserver.port,
      livereload:       false,
      directoryListing: false
    }));
});

//通过浏览器打开本地 Web服务器 路径
gulp.task('openbrowser', function() {
    opn( 'http://' + localserver.host + ':' + localserver.port );
});

//把HTML拷贝到build下 
gulp.task('buildhtml', function() {
  var stream = gulp.src('./*.html')
    .pipe(gulp.dest('./build'));
  return stream;
});

//把CSS拷贝到build下
gulp.task('buildcss', ['styles'] , function() {
  var stream = gulp.src('./css/*.css')
    .pipe(minifycss())
    .pipe(gulp.dest('./build/css'));
  return stream;
});

//把IMG拷贝到build下
gulp.task('buildimg', function() {
  var stream = gulp.src('./img/**')
    .pipe(gulp.dest('./build/img'));
  return stream;
});

//把PLUGIN拷贝到build下
gulp.task('buildplugin', function() {
  var stream = gulp.src('./plugin/**')
    .pipe(gulp.dest('./build/plugin'));
  return stream;
});

//把JS拷贝到build下
gulp.task('buildjs', ['alljs'] , function() {
  var stream = gulp.src('./js/all.js')
    .pipe(uglify())
    .pipe(gulp.dest('./build/js'));
  return stream;
});

//默认任务 gulp start
gulp.task('start', function(){
  gulp.start('styles');
  gulp.start('alljs');
  gulp.start('watch');
  gulp.start('webserver');
  gulp.start('openbrowser');
});

//调试任务 gulp debug
gulp.task('debug', function(){
  gulp.start('styles');
  gulp.start('alljs');
  gulp.start('watch');
  gulp.start('debugwatch');
  gulp.start('webserver');
  gulp.start('openbrowser');
});

//打包 gulp build
gulp.task('build' ,['buildhtml','buildcss','buildimg','buildplugin','buildjs'] ,function(){
  function checkTime(i) {
    if (i < 10) {
      i = "0" + i
    }
    return i
  }
  var d=new Date();
  var year=d.getFullYear();
  var month=checkTime(d.getMonth() + 1);
  var day=checkTime(d.getDate());
  var hour=checkTime(d.getHours());
  var minute=checkTime(d.getMinutes());
  return gulp.src('./build/**')
    .pipe(zip('build-'+year+month+day+hour+minute+'.zip'))
    .pipe(gulp.dest('./'));
});