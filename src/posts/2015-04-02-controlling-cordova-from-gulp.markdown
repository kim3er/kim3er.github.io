---
layout: post
title: "Controlling Cordova from Gulp"
date: 2015-04-02 22:39:27 +0100
comments: true
categories: [ JavaScript, Gulp, Cordova ]
---

It's a story as old as time. Girl meets boy, boy has an annoying two step build process, spread across two directories. Of course I'm talking about having an awesome [Gulp](http://gulpjs.com/) workflow, with a Cordova project clumsily tacked on the side. Well, no more, now you can integrate [Cordova](http://cordova.apache.org/)! into Gulp! Yay!

<!-- more -->

_**NOTE:**You see the code over at [Github](https://github.com/kim3er/cordova-gulp)._

Let's discuss the problem first. Until recently, Gulp and Cordova were two separate Node based, command line powered worlds to me, with seemingly nothing in common. In the given scenario, I'd typically have a two directory structure:

```
app				<-- Source files for the project
cordova			<-- Cordova root directory
	- www		<-- Cordova app directory
gulpfile.js
```

Gulp would take care of transpiling the code in the `app` directory and transferring the spoils to `cordova/www`. Cordova is then responsible for building the Cordova project and delivering the app to an emulator.  Something like:

``` bash
gulp
cd ./cordova
cordova emulate
cd ../
```

Before switching to Gulp, I used to use Middleman for a lot of the transpiling tasks, where I'd maintain a number of bash scripts to create the illusion of cohesion. It didn't feel right when I switched to Gulp though. There must be some similarity between these disparate Node based, command line tools. What was I missing?

You know what I realised? That Gulp is based on Node and so is Cordova; so I can probably access Cordova directly from within my Gulp task. It's never going to be that easy, is it?

Well, it'll be a disappointment if it wasn't that easy. So long story short, it almost is. To demonstrate, I'm going to cook up a quick project, to demonstrate the integration:

``` bash
npm init
touch gulpfile.js
npm install -g cordova gulp ios-deploy
npm install --save-dev gulp cordova-lib del
cordova create ./cordova me.k3r.cordgulp CordovaGulp
```

Accept all the defaults on `npm install`, if you're not sure how to answer. All it does is create your `package.json` and settings can be easily changed at any time.

The `-g` means install globally, and the `--save-dev` will save the packages as development dependancies within the `package.json`. Have a look, you'll see what I mean.

[ios-deploy](https://github.com/phonegap/ios-deploy) is neat if you're on a Mac and want to deploy from script or command line to iOS.

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

``` bash
mv ./cordova/www ./app
```

You now have the almost complete example. If you type in `gulp compile`, `cordova/www` will be recreated with the contents of `app`. Nothing else is going on here at the moment, but think of the possibilities.

We haven't quite finished yet. Type in the following, to add iOS and/or Android as platforms to your new project.

``` bash
cd cordova
cordova platform add ios
cd ../
```

While you're in the `cordova` directory, you could have also run `cordova build` or `cordova emulate ios`, but that's for losers.

Within in the project root, run either of these bad boys:

``` bash
gulp build
gulp emulate
```

That's right, one command to rule them all. `gulp emulate` transpiles the code, moves it to `cordova/www` then kicks off the Cordova `build` and `emulate` commands.

"But how does this sorcery work?" I hear you cry. Cordova developers will mostly recognise Cordova's [NPM](https://www.npmjs.com/) package as a command line tool, but as such a package, we should also be able to require it within a Node script (or in this case, Gulp). The reference here, `cordova = require('cordova-lib').cordova.raw`, provides access to the Cordova's underlying API, exposing stuff like `build` and `emulate`.

It's not all unicorns mind; the API has auto-detection routine in place that works out the project's root directory. This only works however, if you're within Cordova's project structure. I'm positive this can be overcome by 'cleaner' methods of API abstraction, but for the moment I've circumvented the issue by introducing two calls to `process.chdir`. `chdir` changes the working directory of running script. The second call resets the directory, for the purposes of possible task chaining.

See here:

``` js
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

1. We change the directory.
2. We call `run`. `emulate` is an alias for `run`.
3. When the `run` process completes, the directory is reset.

So there you have it, in a single Gulp command you can, transpile, populate, build and emulate. For me, this little nugget has sped up my workflow, and has made the build task more approachable to other developers working on the project.
