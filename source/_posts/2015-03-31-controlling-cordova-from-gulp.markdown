---
layout: post
title: "Controlling Cordova from Gulp"
date: 2015-03-31 22:00:27 +0100
comments: true
categories: [ JavaScript, Gulp, Cordova ]
---

___NOTE:__ You see the code over at [Github](https://github.com/kim3er/cordova-gulp)._

<!-- more -->

``` shell
npm init
touch gulpfile.js
npm install -g cordova gulp ios-deploy
npm install --save-dev gulp cordova-lib del
cordova create ./cordova me.k3r.cordgulp CordovaGulp
mkdir ./app
mv ./cordova/www ./app
gulp compile
cd cordova
cordova platform add ios
cd ../
gulp build
gulp emulate
```