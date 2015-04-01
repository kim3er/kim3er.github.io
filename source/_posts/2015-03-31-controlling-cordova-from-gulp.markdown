---
layout: post
title: "Controlling Cordova from Gulp"
date: 2015-03-31 22:00:27 +0100
comments: true
categories: [ JavaScript, Gulp, Cordova ]
---

It's a story as old as time. Girl meets boy, boy has a two step build process, spread across two directories. Of course I'm talking about having an awesome [Gulp]() workflow, with a Cordova project clumsily tacked on the side. Well no more, now you can integrate [Cordova]()![]() into Gulp! Yay!

<!-- more -->

___NOTE:__ You see the code over at [Github](https://github.com/kim3er/cordova-gulp)._

Let's discuss the problem first. Until recently, Gulp and Cordova were two separate Node based, command line powered worlds to me, with seemingly nothing in common. In the given scenario, I'd typically have a two directory structure:

```
app				<-- Source files for the project
cordova			<-- Cordova root directory
	- www		<-- Cordova app directory
gulpfile.js
```

Gulp would take care of transpiling the code in the `app` directory and transferring the spoils to `cordova/www`. Cordova is then responsible for building the Cordova project and delivering the app to an emulator.  Something like:

``` shell
gulp
cd ./cordova
cordova emulate
cd ../
```

Before switching to Gulp, I used to use Middleman for a lot of the transpiling tasks, where I'd maintain a number of shell scripts to create the illusion of cohesion. It didn't feel right when I switched to Gulp though. There must be some similarity between these disparate Node based, command line tools. What was I missing?

You know what I realised? That Gulp is based on Node and so is Cordova; so I can probably access Cordova directly from within my Gulp task. It's never going to be that easy, is it?

Well, it be a disappointment if it wasn't that easy. So long story short, it almost is. To demonstrate, I'm going to cook up a quick project, to demonstrate the integration:

``` shell
npm init
touch gulpfile.js
npm install -g cordova gulp ios-deploy
npm install --save-dev gulp cordova-lib del
cordova create ./cordova me.k3r.cordgulp CordovaGulp
```

Accept all the defaults on `npm install`, if you're not sure how to answer. All it does is create your `package.json` and settings can be easily changed at any time.

The `-g` means install globally, and the `--save-dev` will save the packages as development dependancies within the `package.json`.

[ios-deploy]() is neat if you're on a Mac and want to deploy from script or command line to iOS.

The last line scaffolds a basic Cordova project. 

Paste in the following to your newly created `gulpfile.js`, but don't run anything yet!

``` js
var gulp = require('gulp')
	del = require('del'),
	cordova = require('cordova-lib').cordova.raw;

var APP_PATH = './app',
	CORDOVA_PATH = './cordova/www';

gulp.task('del-cordova', function(cb) {
	del([ CORDOVA_PATH + '/*' ], function() {
		cb();
	});
});

gulp.task('compile', [ 'del-cordova' ], function(cb) {
	return gulp.src([ APP_PATH + '/**/*' ])
		.pipe(gulp.dest(CORDOVA_PATH));
});

gulp.task('build', [ 'compile' ], function(cb) {
	process.chdir(__dirname + '/cordova');
	cordova
		.build()
		.then(function() {
			process.chdir('../');
			cb();
		});
});

gulp.task('emulate', [ 'compile' ], function(cb) {
	process.chdir(__dirname + '/cordova');
	cordova
		.run({ platforms: [ 'ios' ] })
		.then(function() {
			process.chdir('../');
			cb();
		});
});
```
If you ran anything at the point, you'd replace the default Cordova `www` directory with that stark emptiness of your nonexistent `app` directory. Remedy that with the following, which moves the contents of `cordova/www` to `app`.

``` shell
mv ./cordova/www ./app
```

You now have the almost complete example. If you type in `gulp compile`, `cordova/www` will be recreated with the contents of `app`. Nothing else is going on here at the moment, but think of the possibilities.

We haven't quite finished yet. Type in the following, to add iOs and/or Android as platforms to your new project.

``` shell
cd cordova
cordova platform add ios
cd ../
```

While you're in the `cordova` directory, you could have also run `cordova build` or `cordova emulate ios`, but that's for losers.

Make in the project root, run either of these bad boys:

``` shell
gulp build
gulp emulate
```

That's right, one command to rule them all. `gulp emulate` transpiles the code, moves it to `cordova/www` then kicks off the Cordova `build` and `emulate` commands.

"But how does this sorcery work?" I hear you cry.