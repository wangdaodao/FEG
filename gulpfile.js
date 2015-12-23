/*
使用原始
npm config set registry = "https://registry.npmjs.org/"
使用淘宝
npm config set registry = "https://registry.npm.taobao.org/"

npm install gulp --save-dev -dd
npm install node-sass --save-dev -dd
npm install gulp-sass --save-dev -dd
npm install gulp-autoprefixer --save-dev -dd
npm install gulp-minify-css --save-dev -dd
npm install gulp-livereload --save-dev -dd
npm install gulp-uglify --save-dev -dd
npm install gulp-webserver --save-dev -dd
npm install gulp-concat --save-dev -dd
npm install gulp-clean --save-dev -dd
npm install gulp-zip --save-dev -dd
npm install gulp-sequence --save-dev -dd
npm install opn --save-dev -dd
npm install tiny-lr --save-dev -dd
*/
var lr           = require('tiny-lr'),
    server       = lr(),
    gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss    = require('gulp-minify-css'),
    livereload   = require('gulp-livereload'),
    uglify       = require('gulp-uglify'),
    webserver    = require('gulp-webserver'),
    opn          = require('opn'),
    concat       = require('gulp-concat'),
    clean        = require('gulp-clean'),
    rename       = require("gulp-rename"),
    copy         = require("gulp-copy"),
    zip          = require('gulp-zip'),
    gulpSequence = require('gulp-sequence');

//配置本地Web 服务器：主机+端口
var localserver = {
  host: 'localhost',
  port: '8080'
}

//多余文件删除
gulp.task('clean', function () {
  return gulp.src('./js/all.js')
    .pipe(clean())
});

//合并javascript 文件，合并后文件放入js下按顺序压缩gulp.src(['a.js', 'b.js', 'c.js'])
gulp.task('alljs',['clean'],function(cb){
  gulp.src('./js/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./js'))
    .on('end', cb);
});

//压缩css 文件
gulp.task('styles', function(cb) {
  gulp.src('./css/*.scss')
    .pipe(sass({outputStyle: 'compact'}))
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest('./css'))
    .on('end', cb);
});

//文件监控
gulp.task('watch', function () {
  // Watch .scss files
  gulp.watch('./css/*.scss', ['styles']);
  // Watch .js files
  gulp.watch('./js/*.js', ['alljs']);
  // Create LiveReload server
  livereload.listen();
  // Watch any files in assets/, reload on change
  gulp.watch(['./css/*.scss','./js/*.js']).on('change', livereload.changed);
});

//开启本地 Web 服务器功能
gulp.task('webserver', function() {
  gulp.src( './' )
    .pipe(webserver({
      host:             localserver.host,
      port:             localserver.port,
      livereload:       true,
      directoryListing: false
    }));
});

//通过浏览器打开本地 Web服务器 路径
gulp.task('openbrowser', function() {
    opn( 'http://' + localserver.host + ':' + localserver.port );
});

//将相关项目文件复制到build 文件夹下
gulp.task('buildfiles', function() {
  //根目录文件
  gulp.src('./*.html')
    .pipe(gulp.dest('./build'));
  //CSS文件
  gulp.src('./css/*.css')
    .pipe(minifycss())
    .pipe(gulp.dest('./build/css'));
  //IMG文件
  gulp.src('./img/**')
    .pipe(gulp.dest('./build/img'));
  //plugin文件
  gulp.src('./plugin/**')
    .pipe(gulp.dest('./build/plugin'));
  //压缩后的js文件
  gulp.src('./js/all.js')
    .pipe(uglify())
    .pipe(gulp.dest('./build/js'));
});

//打包主体build 文件夹并按照时间重命名
gulp.task('zip' , function(){
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
    .pipe(zip('build-'+year+month+day +hour+minute+'.zip'))
    .pipe(gulp.dest('./'));
});

//默认任务
gulp.task('start', function(){
  gulp.start('styles');
  gulp.start('clean');
  gulp.start('alljs');
  gulp.start('watch');
  gulp.start('webserver');
  gulp.start('openbrowser');
});

//项目完成提交任务
gulp.task('build', gulpSequence(['styles','alljs'],'buildfiles','zip'));