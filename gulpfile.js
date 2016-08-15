/*
npm install -g cnpm --registry=https://registry.npm.taobao.org

cnpm install

or

cnpm install gulp node-sass gulp-sass gulp-autoprefixer gulp-clean-css gulp-livereload gulp-webserver gulp-zip gulp-plumber gulp.spritesmith opn gulp-file-include gulp-wait npm install gulp-iconfont gulp-iconfont-css gulp-template gulp-rename --save-dev
*/
var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    iconfont     = require('gulp-iconfont'),
    iconfontCss  = require('gulp-iconfont-css'),
    template     = require("gulp-template"),
    autoprefixer = require('gulp-autoprefixer'),
    spritesmith  = require('gulp.spritesmith'),
    cleancss     = require('gulp-clean-css'),
    rename       = require('gulp-rename'),
    livereload   = require('gulp-livereload'),
    webserver    = require('gulp-webserver'),
    zip          = require('gulp-zip'),
    plumber      = require('gulp-plumber'),
    opn          = require('opn'),
    wait         = require('gulp-wait'),
    fileinclude  = require('gulp-file-include'),
    fs           = require("fs");

// 说明
gulp.task('h',function () {
  console.log(' gulp s     开始任务');
  console.log(' gulp b     文件打包');
});

var paths = {
  css: 'static/css',
  js:'static/js',
  img:'static/img',
  svg:'static/svg',
  build:'build',
  buildcss:'build/static/css',
  buildjs:'build/static/js',
  buildimg:'build/static/img'
};

var statics = {
  scss: 'static/css/*.scss',
  css: 'static/css/*.css',
  js:'static/js/**',
  img:'static/img/*.{jpg,png,gif}',
  svg:'static/svg/icon/*.svg',
  font :'static/css/*.{eot,svg,ttf,woff}',
  sprite:'static/img/sprite/',
  spriteName:'../img/',
  spriteCss:'../css/_sprite.scss',
  iconfont:'../css/',
  build:'build/**'
}

// 生成iconfont
var fontName = 'iconfont',
    runTimestamp = Math.round(Date.now()/1000);
gulp.task('iconfont',function(){
  gulp.src(statics.svg)
    .pipe(iconfontCss({
      fontName: fontName,
      path: paths.svg+'/template/_iconfont.scss',
      targetPath:statics.iconfont+'/_iconfont.scss'
      // fontPath: paths.css+'/'
    }))
    .pipe(iconfont({
      fontName: fontName,
      formats: ['svg', 'ttf', 'eot', 'woff'],
      timestamp: runTimestamp,
      normalize: true,
      fontHeight: 1001
     }))
    .pipe(gulp.dest(paths.css));
});

//生成icon预览
gulp.task('iconcss',['iconfont'],function() {
  gulp.src(statics.svg)
    .pipe(iconfontCss({
      fontName: fontName,
      path: paths.svg+'/template/_icon.scss',
      targetPath:'/icon.css'
      // fontPath: paths.css+'/'
    }))
    .pipe(iconfont({
      fontName: fontName,
      formats: ['svg', 'ttf', 'eot', 'woff'],
      timestamp: runTimestamp,
      normalize: true,
      fontHeight: 1001
     }))
    .pipe(gulp.dest(paths.svg));
});
gulp.task('icontemplate',['iconcss'],function() {
  var icons = fs.readdirSync(paths.svg+'/icon/'); 
  icons = icons.map(function(icon){
    return icon.replace(/\.\w+$/, '');
  });
  gulp.src(paths.svg+'/template/template.html')
    .pipe(template({icons: icons}))
    .pipe(rename('icon.html'))
    .pipe(gulp.dest(paths.svg));
});

//编译sass文件
gulp.task('styles',function() {
  return gulp.src(statics.scss)
    .pipe(wait(2000))
    .pipe(sass({outputStyle: 'compact'})
      .on('error', sass.logError))
    .pipe(plumber())
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest(paths.css));
});

// 合并雪碧图
gulp.task('sprite', function () {
  var spriteFolder = ['','a','b','c'],//sprite下的文件夹名称，一定要有第一个，如果只剩''，就只匹配sprite下面的图片
      i = spriteFolder.length-1,
      spriteSass = [];//最后的样式
  for (i; i >= 0; i--) {
    var folder = spriteFolder[i];
    gulp.src(statics.sprite+folder+'/*.{jpg,png,gif}')//需要合并的图片地址
      .pipe(spritesmith({
          imgName: statics.spriteName+folder+(folder==''?'sprite.png':'_sprite.png'),//保存合并后图片的地址
          cssName: statics.spriteCss,//保存合并后对于css样式的地址
          cssFormat: 'scss',
          padding:10,//合并时两个图片的间距
          algorithm: 'alt-diagonal',//top-down,left-right,diagonal,alt-diagonal,binary-tree
          cssTemplate: function (data) {
            data.sprites.forEach(function (sprite) {
              if ((sprite.name.indexOf("-h") == -1)&&(sprite.name.indexOf("-v") == -1)) {
                var spritename = sprite.name; 
              } else if (sprite.name.indexOf("-v") !== -1){
                var spritename = sprite.name.replace("-v",":active"); 
              } else {
                var spritename = sprite.name.replace("-h",":hover"); 
              };
              spriteSass.push(".sp-"+spritename+
              "{" +
              "background-image: url("+sprite.escaped_image+");"+
              "background-position: "+sprite.px.offset_x+" "+sprite.px.offset_y+";"+
              "background-repeat: no-repeat;"+
              // "width:"+sprite.px.width+";"+
              // "height:"+sprite.px.height+";"+
              "}\n");
            });
            return spriteSass.join("");
          }
      }))
      .pipe(gulp.dest(paths.img));
  }
});

gulp.task('fileinclude', function() {
  gulp.src('*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
  .pipe(gulp.dest(paths.build));
});

//文件监控
gulp.task('watch', function () {
  // Watch sprite files
  gulp.watch(statics.sprite+'**', function (event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    gulp.start('sprite');
  });
  // Watch svg files
  gulp.watch(statics.svg, function (event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    gulp.start('icontemplate');
  });
  // Watch .scss files
  gulp.watch(statics.scss, function (event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    gulp.start('styles');
  });
  // Create LiveReload server
  livereload.listen();
  // Watch any files, reload on change
  gulp.watch([statics.css,statics.font,statics.js,statics.img,'*.html'],function(event){
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    livereload.changed(event.path);
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
      livereload:       true,
      directoryListing: false
    }));
});
//通过浏览器打开本地 Web服务器 路径
gulp.task('openbrowser', function() {
  opn( 'http://' + localserver.host + ':' + localserver.port );
});

//默认任务 gulp start
gulp.task('s',['icontemplate','sprite'], function(){
  gulp.start('styles');
  gulp.start('watch');
  gulp.start('webserver');
  gulp.start('openbrowser');
});

//把CSS拷贝到build下
gulp.task('buildcss' , function() {
  return gulp.src([statics.css])
    .pipe(cleancss({keepBreaks: false}))
    .pipe(gulp.dest(paths.buildcss));
});

//把font拷贝到build下
gulp.task('buildfont' , function() {
  return gulp.src(statics.font)
    .pipe(gulp.dest(paths.buildcss));
});

//把IMG拷贝到build下
gulp.task('buildimg',['sprite'], function() {
  return gulp.src(statics.img)
    .pipe(gulp.dest(paths.buildimg));
});

//把JS拷贝到build下
gulp.task('buildjs' , function() {
  return gulp.src(statics.js)
    .pipe(gulp.dest(paths.buildjs));
});

//打包 gulp build
gulp.task('b' ,['fileinclude','buildcss','buildfont','buildimg','buildjs'] ,function(){
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
  return gulp.src([statics.build,'!'+statics.build+'/*.zip'])
    .pipe(zip('build-'+year+month+day+hour+minute+'.zip'))
    .pipe(gulp.dest(paths.build));
});
