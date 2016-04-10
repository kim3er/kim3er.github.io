---
layout: post
title: "Simple routing with JavaScript Decorators"
date: 2015-05-20 22:30:57 +0100
comments: true
categories: [ ES6, JavaScript, Decorators, Routing, MVC ]
---

_**TL;DR:**I've used decorators to generate a bunch of routes from a class._

I can't decide whether this is a legitimate use for decorators, but I knew from the moment I saw this crazy syntax that this was want I wanted to achieve.

<!-- More -->

## What's what?

In a lot of my app projects, I chuck my actions into a series of classes which extend a simple class called `Controller`. My old code for `Controller` is below and as you can see, it exposes an empty array of actions.

``` javascript
class Controller {

	actions() {
		return [];
	}

	constructor(app = {}) {
		this.app = app;
	}

}
```

The idea is that in the extended class, you add 'action' functions, that you then list in the overridden array. See the example `NotesController` below.

``` javascript
class NotesController extends Controller {

	actions() {
		return [
			{ match: 'note', action: 'show' },
			{ match: 'notes/create', action: 'create' },
			{ match: 'notes/new', action: 'new' }
		];
	}

	show(id) {

	}

	create(params, data, $form) {

	}

	new() {

	}

	doSomethingUseful() {

	}

}
```

`NotesController` now advertises which routes it's setup to listen to. Any function not listed n the array is ignored and assumed to be a helper method of some kind. This has alway felt a bit clunky, specifically I didn't like:

1. Overriding a function, whose sole purpose to create and return a new array each time it's called. During the application lifecycle it's typically only called once, but that's not the point. I could have used class properties, but it's still quite a new feature for Babel. I could have used [TypeScript](http://www.typescriptlang.org/) I guess, but [Sublime Text](http://www.sublimetext.com/3) tooling for TS has not been a positive experience and I'm not ready to switch to [Visual Studio Code](https://code.visualstudio.com/), yet.
2. The repetition of writing a function, then list it in an array. #boring.

## So, what's what now?

Glad you asked. I've basically ripped off the `autobind` example from the [Babel 5.0.0 blog post](http://babeljs.io/blog/2015/03/31/5.0.0/#stage-1:-decorators) and created  a new decorator called `route`. Checkout the code for `route` below.

``` javascript
function route(route) {
	return function(target, key, descriptor) {
		var fn = descriptor.value;

		delete descriptor.value;
		delete descriptor.writable;

		if (!route) {
			route = key;
		}

		descriptor.get = function() {
			var bound = fn.bind(this, route);

			Object.defineProperty(this, key, {
				configurable: true,
				writable: true,
				value: bound
			});

			return bound;
		};

		if (!target.routes) {
			target.routes = [];
		}

		target.routes.push({ match: route, action: key });

	};
}
```

The differences between this decorator and the `autobind` example are:

1. `route` takes an optional parameter (also called `route`), that allows you to specify the route to be matched. Optional, in that if missed out, the decorator assumes the name of the action, is also the route.
2. An array of the routes is managed on the instance of the controller, so the array is an instance property now.
3. I'm passing the `route` param to the function, as it's often useful to know the route in the function.

Let's see the new code:

``` javascript
// Controller Class
class Controller {

	constructor(app = {}) {
		this.app = app;

		// In case no routes are specified
		if (!this.routes) {
			this.routes = [];
		}
	}

}

// NotesController Class
class NotesController extends Controller {

	@route('note')
	show(id) {

	}

	@route('notes/create')
	create(params, data, $form) {

	}

	@route()
	new() {

	}

	doSomethingUseful() {

	}

}
```

You can see, no more `actions` function, no more verbose listing of the functions. I've intentionally left out the value of the `new` route, to demonstrate how the 'implied' routing works. If you run the code above in the Babel [REPL](http://babeljs.io/repl/#?experimental=true&evaluate=true&loose=false&spec=false&code=function%20route\(route\)%20%7B%0A%09return%20function\(target%2C%20key%2C%20descriptor\)%20%7B%0A%09%09var%20fn%20%3D%20descriptor.value%3B%0A%0A%09%09delete%20descriptor.value%3B%0A%09%09delete%20descriptor.writable%3B%0A%0A%09%09if%20\(!route\)%20%7B%0A%09%09%09route%20%3D%20key%3B%0A%09%09%7D%0A%0A%09%09descriptor.get%20%3D%20function\(\)%20%7B%0A%09%09%09var%20bound%20%3D%20fn.bind\(this%2C%20route\)%3B%0A%0A%09%09%09Object.defineProperty\(this%2C%20key%2C%20%7B%0A%09%09%09%09configurable%3A%20true%2C%0A%09%09%09%09writable%3A%20true%2C%0A%09%09%09%09value%3A%20bound%0A%09%09%09%7D\)%3B%0A%0A%09%09%09return%20bound%3B%0A%09%09%7D%3B%0A%0A%09%09if%20\(!target.routes\)%20%7B%0A%09%09%09target.routes%20%3D%20%5B%5D%3B%0A%09%09%7D%0A%0A%09%09target.routes.push\(%7B%20match%3A%20route%2C%20action%3A%20key%20%7D\)%3B%0A%0A%09%7D%3B%0A%7D%0A%0Aclass%20Controller%20%7B%0A%0A%09constructor\(app%20%3D%20%7B%7D\)%20%7B%0A%09%09this.app%20%3D%20app%3B%0A%0A%09%09if%20\(!this.routes\)%20%7B%0A%09%09%09this.routes%20%3D%20%5B%5D%3B%0A%09%09%7D%0A%09%7D%0A%0A%7D%0A%0A%2F%2F%20NotesController%20Class%0Aclass%20NotesController%20extends%20Controller%20%7B%0A%0A%09%40route\('note'\)%0A%09show\(id\)%20%7B%0A%0A%09%7D%0A%0A%09%40route\('notes%2Fcreate'\)%0A%09create\(params%2C%20data%2C%20%24form\)%20%7B%0A%0A%09%7D%0A%0A%09%40route\(\)%0A%09new\(\)%20%7B%0A%0A%09%7D%0A%09%0A%09doSomethingUseful\(\)%20%7B%0A%09%0A%09%7D%0A%0A%7D%0A%0Aconsole.log\(new%20NotesController\(\).routes\)), you should get the output below:

``` javascript
[
	{"match":"note","action":"show"},
	{"match":"notes/create","action":"create"},
	{"match":"new","action":"new"}
]
```

With the exception of `new`, the array is identical to that of the first example. That be some nice ass syntactic sugar. The future rocks. Peace out.
