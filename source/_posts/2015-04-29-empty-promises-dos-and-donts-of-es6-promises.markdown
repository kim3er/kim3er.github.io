---
layout: post
title: "Empty Promises: Dos and Don'ts of ES6 Promises"
date: 2015-04-29 22:10:03 +0100
comments: true
categories: [ ES6, JavaScript, Promises ]
---

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
			return new Promise((resolve) => { resolve(); });
		});
}
```

The `display` function is doing exactly the same, but now the promises are chained. The new `Promise` declaration in the second `then` callback, enables the `display` function to be chained itself:

``` js
new Example().display(1).then(() => { console.log('async finished'); });
```

## Empty Promises

To expedite the example above, I've started adding a helper function (similar to the example below) to my projects.

``` js
class Util {

	static emptyPromise(val = null) {
		return new Promise((resolve) => { resolve(val); });
	}
	
}
```

The function is poorly names, because it can return a value. I just like the pun. An example of the pun in action:

``` js
class Election {

	fullOf() {
		return Util.emptyPromise()
			.then(() => { return Util.emptyPromise(); });
	}
	
}
```

## In all the right places

I've certainly been guilty of overuse in the past; there is certainly a time and a place for promises. I'd say if the function is clearly an async function (or at least has the potential to be), or provides some conversion functionality that would be useful in a chain, then the function should return a Promise.

``` js
class Conversion {

	static toJson(str) {
		return Util.emptyPromise(JSON.parse(str));
	}

}

class Proxy {

	get(id) {
		return Ajax.request(id)
			.then((response) => { return Conversion.toJson(response.responseText); });
	}

}

new Proxy().get(1).then((json) => { console.log(json); });
```

An example of when I wish I'd used Promises earlier, would a data layer I wrote on top of `localStorage`, which itself is synchronous. When I wanted to apply the data layer to Chrome Apps, which only supports an asynchronous version of `localStorage`, I was not a happy bunny.