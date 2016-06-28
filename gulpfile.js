/*
使用原始
npm config set registry https://registry.npmjs.org
使用淘宝
npm config set registry http://registry.npm.taobao.org
npm install --save-dev
npm install gulp node-sass gulp-sass gulp-autoprefixer gulp-minify-css gulp-livereload gulp-uglify gulp-webserver gulp-concat gulp-clean gulp-zip gulp-plumber gulp.spritesmith opn --save-dev
*/
var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    spritesmith  = require('gulp.spritesmith'),
    cleanCSS    = require('gulp-clean-css'),
    livereload   = require('gulp-livereload'),
    uglify       = require('gulp-uglify'),
    webserver    = require('gulp-webserver'),
    concat       = require('gulp-concat'),
    clean        = require('gulp-clean'),
    zip          = require('gulp-zip'),
    plumber      = require('gulp-plumber'),
    opn          = require('opn');

// 说明
gulp.task('help',function () {
  console.log(' gulp debug     调试任务');
  console.log(' gulp watch     文件监控');
  console.log(' gulp build     文件打包');
  console.log(' gulp help      帮助');
});

//删除js文件
gulp.task('cleanjs', function () {
  return gulp.src('./js/all.js')
    .pipe(clean());
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

// 合并雪碧图
gulp.task('sprite', function () {
  return gulp.src('img/sprite/*.png')//需要合并的图片地址
    .pipe(spritesmith({
        imgName: '../img/sprite.png',//保存合并后图片的地址
        cssName: '../css/_sprite.scss',//保存合并后对于css样式的地址
        cssFormat: 'scss',
        padding:5,//合并时两个图片的间距
        algorithm: 'binary-tree',//注释1
        cssTemplate: function (data) {
          var arr=[];
          data.sprites.forEach(function (sprite) {
              arr.push(".icon-"+sprite.name+
              "{" +
              "background-image: url('"+sprite.escaped_image+"');"+
              "background-position: "+sprite.px.offset_x+" "+sprite.px.offset_y+";"+
              "width:"+sprite.px.width+";"+
              "height:"+sprite.px.height+";"+
              "}\n");
          });
          return arr.join("");
        }
    }))
    .pipe(gulp.dest('./img'));
});

//文件监控
gulp.task('watch', function () {
  // Watch sprite files
  gulp.watch('img/sprite/**', ['sprite']);
  // Watch .scss files
  gulp.watch('css/**', ['styles']);
  // Watch .js files
  gulp.watch('js/**', ['alljs']);
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

//配置本地Web 服务器：主机+端口
var localserver = {
  host: 'localhost',
  port: '8080'
}
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
  return gulp.src('./*.html')
    .pipe(gulp.dest('./build'));
});

//把CSS拷贝到build下
gulp.task('buildcss', ['styles'] , function() {
  return gulp.src('./css/*.css')
    .pipe(cleanCSS())
    .pipe(gulp.dest('./build/css'));
});

//把IMG拷贝到build下
gulp.task('buildimg', function() {
  return gulp.src('./img/**')
    .pipe(gulp.dest('./build/img'));
});

//把PLUGIN拷贝到build下
gulp.task('buildplugin', function() {
  return gulp.src('./plugin/**')
    .pipe(gulp.dest('./build/plugin'));
});

//把JS拷贝到build下
gulp.task('buildjs', ['alljs'] , function() {
  return gulp.src('./js/all.js')
    .pipe(uglify())
    .pipe(gulp.dest('./build/js'));
});

//默认任务 gulp start
gulp.task('start', function(){
  gulp.start('sprite');
  gulp.start('styles');
  gulp.start('alljs');
  gulp.start('watch');
  gulp.start('webserver');
  gulp.start('openbrowser');
});

//调试任务 gulp debug
gulp.task('debug', function(){
  gulp.start('sprite');
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