---
layout: post
title: "Consuming ES6 modules in NPM packages"
date: 2015-04-12 14:06:12 +0100
comments: true
categories: [ JavaScript, Gulp, ES6, Modules, NPM ]
---

I'm going to have to start coming up with more interesting title for my posts. My eyes are watering at the thought of 'Consuming ES6 modules in NPM packages'. Maybe something more exciting, like 'Munching on the nuggets of next gen wonderment'. I'll work on it.

In this post I'm going to describe how you can make use of [Babel's](https://babeljs.io/) support for [ES6 modules](https://babeljs.io/docs/learn-es6/#modules), and how you might consume them as [NPM](https://www.npmjs.com/) packages. It's pretty neato stuff and makes for very clean code. Read on!

<!-- more -->

_**TL;DR:**Scroll down to the [Star Wars](http://www.starwars.com/) reference for the actual tutorial._

_**NOTE:**This tutorial has two [Github](https://github.com/) repos, [this one](https://github.com/kim3er/example-es6-module) and [this one](https://github.com/kim3er/example-module-consumer)._

Modules have existed in JS space for a while now. I've dabbled in the past, because I'm a big fan of results, I mean who wouldn't be?

* Keeps junk out of the global scope
* Only load what you need
* Inferred order of compilation

I'm just going to pick up on that last point for a moment. While I dabbled, I never really embraced modules as part of a longer term strategy. My reluctance was due to inherent ugliness of implementation, with anything but Node's `require` and `exports` syntax. The ugliness is there to make these great ideas work in the browser.

Using the fantastic [jQuery](https://jquery.com/) as an example, stuff like:

``` js
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}
```

and

``` js
// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	});
}
```

and

``` js
// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( typeof noGlobal === strundefined ) {
	window.jQuery = window.$ = jQuery;
}
```

I get why it's all there, and I appreciate the efforts teams like jQuery put into compatibility with all of these different systems. I have benefitted from those efforts on many occasions. I bet it's a pain in the backside to maintain, it's very clever, but also, U-G-L-Y.

### Flashback (wavy lines)

I was drawn back into the fold, as the result of a recent ES6 based project I've been working on. I was gorging on the beautiful ES6 class syntax, doing a fine job of controlling compilation through the use of sub folders.

As an example, the classes in directories 'controller' and 'model', inherit from directory 'base'. Classes in 'controller' can reference classes in 'model', but not the other way around.

``` bash
root
	base			<-- Compile first
	controller		<-- Compile third
	model			<-- Compile second
```

``` js base/base_class.js
class BaseClass {
	parent()  {
		console.log('something interesting');
	}
}
```

``` js controller/app_controller.js
class AppController extends BaseClass {
	action()  {
		let user = new UserModel();
		console.log('I\'m an action');
	}
}
```

``` js model/user_model.js
class UserModel extends BaseClass {
	constructor() {
		this.parent();
		console.log('I\'m a model');
	}
}
```

This all worked great, better than great, I was king of the world. Until I needed to create `BaseController`, that extends `BaseClass` and is extended by `AppController`.

``` js controller/base_controller.js
class BaseController extends BaseClass {
	defaultAction()  {
		console.log('I\'m a default action');
	}
}
```

``` js controller/app_controller.js
class AppController extends BaseController {
	action()  {
		this.defaultAction();
	}
}
```

Due to the dreaded alphabet, `AppController` compiles before `BaseController`. Arrrgh. Why world, would you treat me this way?!

``` bash
controller
	app_controller.js		<-- Attempts to compile first, but BaseController doesn't exist yet
	base_controller.js		<-- Waits patiently
```

Don't tell anyone, but my initial fix was to:

``` bash
controller
	0.base_controller.js	<-- Compiles first
	app_controller.js		<-- Compiles second
```

I kidded myself for a while that this was a valid design decision, until maybe my third or forth 'zero dot' file. I needed a better way of controlling the order of compilation; it also felt like those base classes could be reused.

## And so, it begins. Destroy them, destroy them all.

We're going to create two projects; the [module](https://github.com/kim3er/example-es6-module) and the [consumer](https://github.com/kim3er/example-module-consumer).

### The module

The module package will be written in ES6 JavaScript, but will need to be transpilied to ES5, for compatibility. So the ugliness is still there, just hidden. We'll use [Gulp](http://gulpjs.com/) and Babel for the build.

#### The setup

I've created a directory called 'blog', in here I'm writing the following, in terminal:

``` bash
mkdir es6-module
cd es6-module
npm init						<-- Just enter through the defaults
mkdir src
touch gulpfile.js .gitignore
```

Your project should look like:

``` bash
es6-module
	src					<-- This is where we\'re going to put our ES6
	.gitignore			<-- We\'ll need to ignore \'node-modules\', when this goes to GIT
	gulpfile.js			<-- Gulp build file
	package.json		<-- This was created when you typed in \'npm init\'
```

Make '.gitignore' look this:

``` text .gitignore
node_modules
```

Change the `main` option in 'package.json' to read './lib/index.js'. A 'lib' directory will be created as part of the build process, which will contain our ES5 code.

``` json
{
	....
	"main": "./lib/index.js",
	....
}
```

`main` is the entry point to our package. In a consumer, if you were to `require('es6-module')`, you'll get the exports from the `main` file.

#### The build script

We need a build script in our 'gulpfile.js'.

``` js gulpfile.js
var gulp = require('gulp'),
	del = require('del'),
	babel = require('gulp-babel');

var SRC_PATH = './src',
	LIB_PATH = './lib';

gulp.task('clear', function(cb) {
	del([ LIB_PATH + '/*' ], function() {
		cb();
	});
});

gulp.task('build', [ 'clear' ], function() {
	return gulp.src([ SRC_PATH + '/**/*.js' ])
				.pipe(babel({ blacklist: [ 'useStrict' ] }))
				.pipe(gulp.dest(LIB_PATH));
});

gulp.task('default', function() {
	gulp.start('build');
});
```

The script has three dependancies:

1. Gulp - The script runner. Like [Grunt](http://gruntjs.com/), but code first.
2. [Del](https://www.npmjs.com/package/del) - A little package for deleting stuff.
3. Babel - ES6 transpiler. Reinvigorated my already deeply unnatural love of JavaScript. Hallelujah.

Install the dependancies like so:

``` bash
npm install -g gulp babel
npm install --save-dev gulp del gulp-babel
```

I think the `clear` task is self explanatory, so lets talk about `build`. Typically in a build script, it's tempting to concatenate, but our package is going to benefit from keeping the code in separate files. By keeping the code in separate files, modular, we'll be implementing JavaScript module benefit #2 'Only load what you need'.

The code itself is transpiled through Babel, to create the ES6 code in 'lib'. I've blacklisted 'useStrict'. I do this by default, because `"use strict"` can stop execution in iOS UIWebViews, specifically when using [Cordova](http://cordova.apache.org/).

#### The code

In the src directory, create the following files:

``` bash
src
	clever_class.js	<-- An example module
	index.js		<-- Our main file
```

``` js src/clever_class.js
export class CleverClass {
	constructor() {
		console.log('I\'m a clever class');
	}
}
```

``` js src/index.js
export * from './clever_class';
```

_I think you can already see how useful our new package is going to be._

`CleverClass` is pretty unexceptional, except for the addition of `export` before the `class` declaration. `export` tells Babel that we want to reference `CleverClass` as module.

The code in 'index.js' is really interesting. We're literally creating an index to all modules in our package, that we want made public. `export * from` (not `import`), re-exports `CleverClass` as part of 'index.js'.

Think about the implications here. You can have twenty different classes in this directory, all extending each other in different and exciting ways. From 'index.js', you choose which of those classes make it to your public API. `CleverClass` may inherit from a class called `BaseClass`, but only `CleverClass` is accessible, even though `CleverClass` still benefits from the existence of `BaseClass`.

_At this point, you're starting to feel like Skeletor, just before he was robbed of the powers of Grey Skull._

Okay, build the mutha:

``` bash
gulp build
```

Any errors? No, great. You should now have a 'lib' directory that mirrors the structure of 'src', just with ES5 code, instead of ES6.

_**NOTE:**This feels a bit 'fly-by the seat of your pants' coding. Usually I'd have a test suite in the project, to ensure that we're all rocking in the right direction. However, we're about to build a consumer for exactly that, and for the purposes of this tutorial I wanted to keep concerns clean and avoid duplication. You dig?_

### The consumer

The purpose of this tutorial is to demonstrate how you can consume ES6 modules, contained within an NPM package. To do this, we need a separate project, from which to consume the package; this is that project.

#### The setup

From the blog directory:

``` bash
mkdir module-consumer
cd module-consumer
npm init						<-- Just enter through the defaults
mkdir app
touch gulpfile.js .gitignore
```

Here is our '.gitignore':

``` text .gitignore
.web
node_modules
```

Here is our directory structure:

``` bash
module-consumer
	app					<-- This is where we\'re going to put our test app
	.gitignore			<-- We'll need to ignore \'node-modules\', when this goes to GIT
	gulpfile.js			<-- Gulp build file
	package.json		<-- This was created when you typed in \'npm init\'
```

#### The build script

Our test app is going to be a very simple website, so we're going to need a web server, in this case [Connect](https://github.com/senchalabs/connect). Because we're using a website as our testbed, we need to a way to consume the NPM package in a way that the browser understands; for this, we will use [Browserify](http://browserify.org/).

``` js gulpfile.js
var gulp = require('gulp'),
	connect = require('gulp-connect'),
	del = require('del'),
	watch = require('gulp-watch'),
	runSequence = require('run-sequence'),
	babelify = require('babelify'),
	browserify = require('browserify'),
	source = require('vinyl-source-stream');

var APP_PATH = './app',
	WEB_PATH = './.web';

gulp.task('clear', function(cb) {
	del([ WEB_PATH + '/*' ], function() {
		cb();
	});
});

gulp.task('js', function() {
	return browserify({
					entries: APP_PATH + '/app.js',
					debug: true
				})
				.transform(babelify)
				.bundle()
				.pipe(source('app.js'))
				.pipe(gulp.dest(WEB_PATH));
});

gulp.task('index', function() {
	return gulp.src([ APP_PATH + '/index.html' ])
		.pipe(gulp.dest(WEB_PATH));
});

gulp.task('connect', function(cb) {
	connect.server({
		root: WEB_PATH,
		livereload: true
	});

	cb();
});

gulp.task('livereload', function () {
	return gulp.src( WEB_PATH + '/**/*' )
		.pipe(connect.reload());
});

gulp.task('serve', [ 'clear' ], function(cb) {
	runSequence(
		[ 'js', 'index' ],
		'connect',
		function() {
			watch([ APP_PATH + '/app.js' ], function() { gulp.start('js'); });
			watch([ APP_PATH + '/index.html' ], function() { gulp.start('index'); });
			watch([ WEB_PATH + '/**/*' ], function() { gulp.start('livereload'); });

			cb();
		}
	);
});
```

The script has these dependancies:

1. Gulp
2. Gulp Connect - Our web server.
3. Del
4. [Gulp Watch](https://www.npmjs.com/package/gulp-watch) - Kicks off Gulp tasks, when a file changes.
5. [Run Sequence](https://www.npmjs.com/package/run-sequence) - Asynchronous task management. [Read my blog](/blog/2015/03/23/in-the-name-of-gulp/).
6. [Babelify](https://github.com/babel/babelify) - Babel transformer for Browserify.
7. Browserify - Makes Node's `require` work in the browser.
8. [Vinyl Source Stream](https://www.npmjs.com/package/vinyl-source-stream) - Makes Browserify work with Gulp.

Install them:

``` bash
npm install --save-dev gulp gulp-connect del gulp-watch run-sequence babelify browserify vinyl-source-stream
```

Here's a quick rundown of the tasks in this script:

##### js

Transpiles and concatenates the contents of 'app/app.js' (not created yet), using Browserify. Browserify follows every `require`, creates a virtual tree, then bundles all the code in one file.

_I mean, wow, just wow._

We're not using the `require` syntax though, so we need Babelify. Babelify transforms/transpiles the ES6 syntax to ES5, for Browserify to understand.

The result of which is outputted to our temporary web directory ('.web', which doesn't exist yet).

##### index

Moves 'app/index.html' to '.web/index.html'. You don't want to be working directly in '.web'.

##### connect

Uses Connect to start a web server, with [Live Reload](http://livereload.com/).

##### livereload

Reacts to file changes. Live Reload reloads your browser programmatically. It's pure magic.

##### serve

This is what we type into terminal. It's a 'stitch everything together task'. We use Run Sequence to run our two compilation tasks, `js` and `index`, before kicking off the web server task `connect`. Finally, we set off the file watchers, that react accordingly to file changes.

#### The code

I'm going to start by boilerplating 'index.html' in the 'app' directory; the sole point of this file is to load 'app.js'.

``` html app/index.html
<!DOCTYPE html>
<html>
<head>
	<title></title>
	<script type="text/javascript" src="./app.js"></script>
</head>
<body>

</body>
</html>
```

Here's 'app.js'.

``` js app/app.js
// Example 1: Namespace
import * as es6 from 'es6-module';

new es6.CleverClass();


// Example 2: Choose exports
// import { CleverClass } from 'es6-module';

// new CleverClass();


// Example 3: Target individual files
// import { CleverClass } from 'es6-module/lib/clever_class';

// new CleverClass();
```

'app.js' contains three examples of how can access 'CleverClass' from our first project... Aww crap, hang on a minute, we've not actually referenced our 'es6-module' package!

``` bash
npm install --save-dev ../es6-module
```

_**NOTE:**NPM allows you to install local packages, that's what going on in the code above._

What was I saying? Right, three examples. They should all have the same result, but show the flexibility was the ES6 way of doing modules:

1. Namespace - Using `as`, you can wrap your imports in a namespace. Very tidy.
2. Be selective - You may only want to use one or two classes, list them in curly brackets!
3. Don't pull in the whole library - Prepare to have your mind blown. 'Boom'. You can reference individual modules within the package. Don't say a word, it's alright, I know. #shhh

Run the server and breath in the sweet, sweet smell of success.

``` bash
gulp serve
```

I accept the payoff is a little underwhelming. If all is well, when you open you dev tool in a browser, pointed at [http://localhost:8080](http://localhost:8080), you should see:

``` text
I'm a clever class
```

### The conclusion

That's not the point. The point is, "I'm a clever class" was written in module in one package, and accessed from a script in another. All the code was written in ES6, and only the files needed, were accessed in the test site.

We've gained:

1. A modular build.
2. A reusable library.
3. Only compile what you use.
4. Future proofing, with ES6 compatible base code.

We. Are. Awesome.
