---
layout: post
title: "Empty Promises: Dos and Don'ts of ES6 Promises"
date: 2015-04-29 22:10:03 +0100
comments: true
categories: [ ES6, JavaScript, Promises ]
---

___UPDATE 14/06/15:__ Realised the existence of `Promise.resolve`, added info on `Promise.all`._

There is so much I love about the functionality and syntax coming through under the banner of ES6. One such piece of functionality, is the 'Promise'. Promises are not something that needs to be transpiled, as of writing, [all but IE and Opera Mini have support](http://caniuse.com/#feat=promises) out of the box. The stragglers can be polyfilled [quite](https://github.com/jakearchibald/es6-promise) [easily](https://github.com/taylorhakes/promise-polyfill).

What follows, are three tips for using promises more effectively.

<!-- More -->

## Chain, don't nest

When I first started playing with promises, I found myself nesting code blocks more than I would have liked. Code like:

``` js
class Example {

	saveData(data) {
		return new Promise(function(resolve, reject) {
			// Save Data
			resolve(data);
		});
	}
	
	getFromWeb(id) {
		return new Promise(function(resolve, reject) {
			// Get from web
			resolve(data);
		});
	}
	
	display(id) {
		let self = this;
		return new Promise(function(resolve, reject) {
			self.getFromWeb(id)
				.then(function(data) {
					self.saveData(data)
						.then(function(data) {
							// Display somewhere
							resolve();
						});
				});
		});
	}
}

new Example().display(1);
```

Not very readable and not making great use of screen real estate, when you can actually do:

``` js
display(id) {
	let self = this;
	return self.getFromWeb(id)
		.then(function(data) {
			return self.saveData(data);
		})
		.then(function(data) {
			// Display somewhere
			return data;
		});
}
```

The `display` function is doing exactly the same, but now the functionality is chained. The second `then` function deals with the display logic, before returning the data param, enabling the `display` function to be chained itself:

``` js
new Example().display(1).then((data) => { /* Work on data */ console.log('async finished'); });
```

## Empty Promises

I'm one of those people who has never read a VCR manual. I pick up and do, realising only years later, that I didn't need to rush home every time I wanted to record something, because the VCR had a timer. I once wrote a really handy little function in SQL called `VALUENULL`, for dealing with NULL values. I can't believe that sort of functionality wasn't built in, oh wait, [ISNULL](https://www.google.co.uk/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=isnull%20sql).

Well, I find myself in that place again. After triumphing that I'd come up with such a simple way to provide consistent `Promise` returning functions with `Util.emptyPromise` (see below), then worring that such a thing might be considered bad practice. 

``` js
class Util {

	static emptyPromise(val = null) {
		return new Promise((resolve) => { resolve(val); });
	}
	
}
```

You see, the point of the function is to wrap a value (or no value) around a prefab `Promise` that always resolves. You would do this if you were creating a non-blocking/asynchronous API on top of synchronous code. Or if you envisaged blocking code becoming asynchronous in the future and wanted to ensure that the public API didn't feel the affect of such massive breaking changes.

A prime example of this, is when I recently wrote a data layer based on `localstorage` (which is synchronous), then decided that  `localstorage` wasn't cutting the mustard, so replaced with [localForage](http://mozilla.github.io/localForage/) (which is `Promise` based). That weekend is one I won't forget in a hurry.

My point is, `Util.emptyPromise` is a less elegant equivalent to the already existing [Promise.resolve](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve). I'll leave this section with the original pun, because it still makes me chuckle.

The function is poorly named, because it can return a value. I just like the pun. An example of the pun in action:

``` js
class Election {

	fullOf() {
		return Util.emptyPromise()
			.then(() => { return Util.emptyPromise(); });
	}
	
}
```

## Promise.all

You may want to check up my sleeves at this point, because I'm about to make bunnies appear out of thin air.

'Callbacks' is just something you do if you're writing non-blocking JavaScript. Calllbacks, within callbacks, within callbacks. Callbacks are there so that you can control the flow of some logic, which has a dependancy on asynchronous code (like an Ajax request), that will take you away from the main 'blocking' execution thread.

Promises take these callbacks and makes them look a lot prettier, while also providing a platform for deferring the attachment of callbacks. The following example still fires the `console.log`, even though the callback is attached after the `Promise` has already resolved.

``` js
var p = Promise.resolve();
p.then(function() { console.log('test'); });
```

But there is still room to make our code damn right gorgeous. Consider the following code:

``` js
function asyncFuncA() {
  return new Promise(function(r) {
    setTimeout(() => { r('asyncA'); }, 2000);
  });
}

function asyncFuncB() {
  return new Promise(function(r) {
    setTimeout(() => { r('asyncB'); }, 1000);
  });
}

class AsyncController {
  
  render(template, data) {
    return new Promise(function(resolve, reject) {
      // Do render stuff
      resolve({ t: template, d: data });
    });
  }
  
  asyncAction(route) {
    return asyncFuncA()
      .then(function(a) {
        return asyncFuncB()
          .then(b => { return [ a, b ]; });
      })
      .then(data => { return this.render('route', data); });
  } 

}

let c = new AsyncController();

c.asyncAction()
  .then((obj) => { console.log(`${obj.d[0]} + ${obj.d[1]}`); });
```

Looking at the `asyncAction`. `asyncFuncA` and `asyncFuncB` are chained by calling `asyncFuncB` within the callback of `asyncFuncA`. The call to the `render` function starts on a separate tree, consuming the response of both asynchronous functions. A rocky sort of waterfall.

```
asyncAction
	--> asyncFuncA
			--> asyncFuncB
		--> render
```

We can achieve the same with the function below. The second asynchronous function no longer has a dependancy on the first, and we only have to call `then` once.

``` js
 asyncAction(route) {
    return Promise.all([ asyncFuncA(), asyncFuncB() ])
      .then(data => { return this.render('route', data); });
  } 
```

```
asyncAction
	--> asyncFuncA
	--> asyncFuncB
		--> render
```

Pretty hot!

