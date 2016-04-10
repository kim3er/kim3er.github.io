---
layout: post
title: "In the name of Gulp"
date: 2015-03-23 22:41:47 +0000
comments: true
categories: [ JavaScript, Gulp, Task Runners ]
---

_**TL;DR:**Use Gulp 4 if you care about task management. If you can't use Gulp 4, use Gulp 3 with 'runSequence'. Also, I need to start reading documentation more and assuming less._

_**NOTE:**You see the code over at [Github](https://github.com/kim3er/gulp-4-demo)._

The release of Gulp 4 is right around the corner, but you can already use it on the [4.0 branch](https://github.com/gulpjs/gulp/tree/4.0). Here is why you should.

<!-- more -->

##Feelings of inadequacy

When [Grunt](http://gruntjs.com/) gained popularity, I was excited by the premise, but underwhelmed by the execution. I feel this is more due to a deficiency on my part, rather than an actual problem with Grunt, given the [team](http://gruntjs.com/development-team) behind it. Just looking at the [Getting Started](http://gruntjs.com/getting-started) page causes static to course through my brain. #brains

This feeling of inadequacy stayed with me until I found [Gulp](https://github.com/gulpjs/gulp). Gulp's barrier to entry seems a lot lower than Grunt's, it's really a tool you can just run with. Now I feel great about myself, now that I've found 'my people'. Amen brothers and sisters, this is the house of Gulp.

##Asynchronous shrubs

It's not all roses in the garden of Gulp 3 though, well maybe it is, but those roses have thorns. And those thorns all bare the words 'async callbacks'. If you've ever considered Gulp tasks to be modular, building blocks of larger tasks, then you've probably faced the same disappointment that I have, that they're not.

Take this simple gulpfile:

``` js
var gulp = require('gulp')
	sass = require('gulp-sass'),
	babel = require('gulp-babel'),
	del = require('del');

var DEST = './dest',
	SRC = './src';

gulp.task('clean', function(cb) {
	del(DEST, cb);
});

gulp.task('stylesheets', function() {
	return gulp.src(SRC + '/app.scss')
		.pipe(sass())
		.pipe(gulp.dest(DEST));
});

gulp.task('javascripts', function() {
	return gulp.src(SRC + '/app.js')
		.pipe(babel({ blacklist: [ 'useStrict' ] }))
		.pipe(gulp.dest(DEST));
});

gulp.task('html', function() {
	return gulp.src(SRC + '/app.html')
		.pipe(gulp.dest(DEST));
});

gulp.task('default', [ 'clean', 'stylesheets', 'javascripts', 'html' ], function() {

});
```

The script above takes the contents of `src` and sticks it in `dest`. There is a problem with the script above, that becomes apparent when you check the output:

``` bash
[22:02:10] Starting 'clean'...
[22:02:10] Starting 'stylesheets'...
[22:02:10] Starting 'javascripts'...
[22:02:10] Starting 'html'...
[22:02:10] Finished 'clean' after 23 ms
[22:02:10] Finished 'javascripts' after 48 ms
[22:02:10] Finished 'html' after 45 ms
[22:02:10] Finished 'stylesheets' after 55 ms
[22:02:10] Starting 'default'...
[22:02:10] Finished 'default' after 12 μs
```

Look at the fifth entry, it's the `clean` task finishing after 23 milliseconds, after all the other tasks have already started. So the clean script is still deleting stuff after the other tasks have started moving their stuff across.

##Something funny about iteration

``` js
gulp.task('default', [ 'clean' ], function() {
	[ 'stylesheets', 'javascripts', 'html' ].forEach(function(taskName) {
		gulp.start(taskName);
	});
});
```

With the `default` task above, the `clean` task will complete before any other task starts; no more conflict. Thing is though, looking at the output, the `default` task is the first to finish after `clean`. Because Gulp tasks are asynchronous (non blocking), the `default` task has no reason to hang around waiting for all the tasks in the `forEach` to complete; the code is only interested in starting each task. This isn't a big deal in our example, but what if you then needed to add a third step?

``` js
gulp.task('build', [ 'clean' ], function(cb) {
	[ 'stylesheets', 'javascripts', 'html' ].forEach(function(taskName) {
		gulp.start(taskName);
	});
	cb();
});

gulp.task('deploy', [ 'build' ], function() {
	console.log('deploy!');
});

gulp.task('default', [ 'deploy' ], function() {

});
```

Check out the output:

``` bash
[22:28:20] Starting 'clean'...
[22:28:20] Finished 'clean' after 8.59 ms
[22:28:20] Starting 'build'...
[22:28:20] Starting 'stylesheets'...
[22:28:20] Starting 'javascripts'...
[22:28:20] Starting 'html'...
[22:28:20] Finished 'build' after 10 ms
[22:28:20] Starting 'deploy'...
deploy!
[22:28:20] Finished 'deploy' after 59 μs
[22:28:20] Starting 'default'...
[22:28:20] Finished 'default' after 2.89 μs
[22:28:20] Finished 'html' after 42 ms
[22:28:20] Finished 'javascripts' after 45 ms
[22:28:20] Finished 'stylesheets' after 52 ms
```

The `deploy` task finishes before the `build` tasks have completed, which is obviously not ideal!

##My 'go to' for async code (given up on the 'humor')

I had expected to find that the `start` function would support a callback or even an event emitter. That being the case, we could use something like [async](https://github.com/caolan/async) (a neat package for dealing with asynchronous code) to do something like:

``` js
	async
		.eachSeries(
			[ 'stylesheets', 'javascripts', 'html' ],
			function(taskName, callback) {
				gulp.start(taskName, function() { callback(); });
				// or
				// gulp.start(taskName).on('end', callback);
			},
			function(err) {
				cb()
			}
		);
```

But alas, not. The `start` function is fire and forget. In the example above, crazy stuff happens in the output:

``` bash
[20:34:15] Starting 'clean'...
[20:34:15] Finished 'clean' after 8.25 ms
[20:34:15] Starting 'build'...
[20:34:15] Starting 'stylesheets'...
[20:34:15] Finished 'stylesheets' after 25 ms
```

##'runSequence', a beautiful stopgap

What you need, is an unassuming, wicked little plugin called [run-sequence](https://www.npmjs.com/package/run-sequence). Using 'run-sequence', you can do something like:

``` js
gulp.task('build', [ 'clean' ], function(cb) {
	runSequence(
		[ 'stylesheets', 'javascripts', 'html' ],
		cb
	);
});
```

You can see from the output that we get exactly what we want:

``` bash
[20:41:34] Starting 'clean'...
[20:41:34] Finished 'clean' after 8.18 ms
[20:41:34] Starting 'build'...
[20:41:34] Starting 'stylesheets'...
[20:41:34] Starting 'javascripts'...
[20:41:34] Starting 'html'...
[20:41:34] Finished 'html' after 44 ms
[20:41:34] Finished 'stylesheets' after 54 ms
[20:41:34] Finished 'javascripts' after 49 ms
[20:41:34] Finished 'build' after 56 ms
[20:41:34] Starting 'deploy'...
deploy!
[20:41:34] Finished 'deploy' after 81 μs
[20:41:34] Starting 'default'...
[20:41:34] Finished 'default' after 3.88 μs
```

'run-sequence' is cool, but there is a better way.

##The point of the post

Gulp 4 uses [undertaker](https://github.com/phated/undertaker) for task management. This is significant because 'undertaker' supports the chaining of series and parallel tasks. In order to make use of this functionality, you need to install the prerelease version of Gulp, which is easily done by following this [guide](http://demisx.github.io/gulp4/2015/01/15/install-gulp4.html).

You can see examples of series and parallel functionality, [here](https://github.com/gulpjs/gulp/blob/4.0/docs/recipes/running-tasks-in-series.md), but check this out:

``` js
gulp.task('build', gulp.series('clean', 'stylesheets', 'javascripts', 'html'));

gulp.task('deploy', gulp.series('build', function(cb) {
	console.log('deploy!');
	cb();
}));

gulp.task('default', gulp.series('deploy'));
```

The difference here is that the dependancies array and callback have been replaced with chain-able `series` functions. You can see from the output below that, while the `deploy` task appears to start too early, the `console.log` demonstrates that the meat and veg of the task runs when it needs to.

``` bash
[21:39:29] Starting 'default'...
[21:39:29] Starting 'deploy'...
[21:39:29] Starting 'build'...
[21:39:29] Starting 'clean'...
[21:39:29] Finished 'clean' after 8.95 ms
[21:39:29] Starting 'stylesheets'...
[21:39:29] Finished 'stylesheets' after 17 ms
[21:39:29] Starting 'javascripts'...
[21:39:29] Finished 'javascripts' after 32 ms
[21:39:29] Starting 'html'...
[21:39:29] Finished 'html' after 2.98 ms
[21:39:29] Finished 'build' after 62 ms
[21:39:29] Starting '<anonymous>'...
deploy!
[21:39:29] Finished '<anonymous>' after 222 μs
[21:39:29] Finished 'deploy' after 63 ms
[21:39:29] Finished 'default' after 65 ms
```

To sum up. Gulp 4 is a huge step forward in terms of task management. I've had no problems with v4 so far, but if you need to hang with v3 for a little while longer, 'run-sequence' is a good option.
