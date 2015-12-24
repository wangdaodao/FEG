# FEG

Front-End Gulp
前端开发集成解决方案

## 概述

FEG 是一个基于 gulp/gulp-plugins 的前端开发集成解决方案。FEG 定义了一系列任务，这些自动执行的任务可以把你从繁杂无聊的复制、粘贴、压缩、重命名、打包等事务中解脱出来，从而更专注于具体业务的开发实现。

## 特性

集成了常用任务，后期会增加更多功能：

功能 | 描述
---- | ---- 
server | 本地 http 服务
livereload | 浏览器自动刷新
sass | 文件编译
concat | 文件合并 
minify | 压缩文件
zip  | 代码打包

## 安装 FEG

1、获取 FEG 包

```
$ git clone https://github.com/wangdaodao/feg.git
```

2、进入FEG目录
```
$ cd feg
```

3、安装 FEG
```
$ npm install
```

4、启动
```
$ gulp start
```

5、调试
```
$ gulp debug
```

6、打包
```
$ gulp build
```

由于网络问题安装过程会持续一段时间，请耐心等候。

## 如何使用

1、进入项目目录 FEG/ 执行 gulp start 命令。此时浏览器会自动打开，并且实时响应你的代码变化。需自行安装（[livereload插件](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei)）

2、进入根目录进行开始工作。

3、打包代码自动生成到build文件夹下，根目录会生成build.zip

[![build](http://wangdaodao.gitcafe.io/uploads/2015/12/feg.gif)](http://wangdaodao.gitcafe.io/uploads/2015/12/feg.gif)

## 常见问题
由于网络原因安装过程中极有可能出现下列问题，在后面给出了解决方案。

安装 node-sass/gulp-sass 失败
原因：是无法连接亚马逊云服务器下载二进制文件

没有生成build压缩包。
原因：第一次build的时候，build文件夹不存在所以没有

#### 解决方案

1. 下载 [node_modules.zip](http://http://pan.baidu.com/s/1gdRZV83)
2. 解压 node_modules.zip 到 feg/node_modules 目录下（feg/node_modules）
3. 重新尝试 npm install

我们已将这相关软件包安装包并打包在 node_modules.zip 中，解压后你可以在 feg/node_modules 中找到它们。

## 鸣谢
FEG 用到了很多开源软件包，没有这些开源项目就没有FEG，在此对相关开源团队表示由衷的感谢！

## LICENSE

The MIT License (MIT)