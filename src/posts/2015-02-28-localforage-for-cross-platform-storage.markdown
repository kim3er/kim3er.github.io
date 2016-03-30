---
layout: post
title: "localForage for cross-platform storage"
date: 2015-02-28 09:30:05 +0000
comments: true
categories: [ JavaScript, Storage, Web ]
---

_TL;DR: You should be using [localForage](https://mozilla.github.io/localForage/) for all your web based local storage needs. It's wonderful._

Storage in general is a bit of a tricky one in hybrid development. There are three main types of storage (excluding bespoke implementations and filesystem) you potentially have access to in a web based development:

<!-- more -->

## localStorage
Until recently, my "go to guy" for app storage. localStorage is really easy to use key-value storage, that is at the time of writing, the only consistent cross-platform storage mechanism. The problem with localStorage though, is that you typically only get access to 5MB. This has always been sufficient for my needs in the past, but you can't help thinking that's a scalability problem waiting to happen. The limit speaks to the intended use for this sort of storage; if you've a lot of data, look somewhere else.

``` javascript
localStorage.setItem('key', 'value');
```

[Compatibility](http://caniuse.com/#feat=namevalue-storage)

## WebSQL
WebSQL is an implementation of Sqlite, which is great, because I love Sqlite. What is not so great is that there is no support for IE/Firefox, and non seemingly on the horizon. I suspect it's due to the lack of involvement from two major vendors, that [W3C ceased working on the specification in November 2010](http://en.wikipedia.org/wiki/Web_SQL_Database). No more to be said.

``` javascript

var database = openDatabase('testDB', '1.0', 'Test Database', 1024 * 1024);
database.transaction(function (transaction) {
   transaction.executeSql('CREATE TABLE IF NOT EXISTS entries (id INTEGER PRIMARY KEY, value VARCHAR)');
   transaction.executeSql('INSERT INTO entries (value) VALUES ("value")');
});
```

[Compatibility](http://caniuse.com/#feat=sql-storage)

## IndexedDB
IndexedDB has gained [greater platform support of late](http://www.girliemac.com/blog/2014/07/03/indexeddb/). Even so, with support having only just been implemented in iOS & Android, legacy support is an issue. The Blob support is really interesting. But actually, beyond what I've read, I don't know too much about IndexedDB, I've never really used it.

_NOTE: I went hunting around for an example for IndexedDB, the best article I came across was [this one](http://code.tutsplus.com/tutorials/working-with-indexeddb--net-34673).  Wow, is IndexedDB long winded or what?!_

[Compatibility](http://caniuse.com/#feat=indexeddb)

So, which storage mechanism am I using? Well, I'm probably using IndexedDB in most cases. Ehh? I recently had call to convert a Cordova app to a Chrome app. The app in question was using localStorage. Trick is, Chrome apps don't support standard localStorage. They have their own version (called [chrome.storage](https://developer.chrome.com/apps/storage)) that is very similar to localStorage, but is asynchronous nature. I didn't really want to rewrite the whole data layer specifically to work with Chrome app, but I found the idea of making it  asynchronous appealing . Maybe it was time to break my reliance on localStorage.

I found [localForage](https://mozilla.github.io/localForage/), a Mozilla library that wraps localStorage, WebSQL and IndexedDB into asynchronous localStorage API. Perfect! The library basically uses whatever is available; You can even set or of precedence and write your own adapters (I'm thinking [chrome.storage.sync](https://developer.chrome.com/apps/storage#property-sync)).

Below is a fragment of the code I've converted to use localForage. The JavaScript is written using ES6.

``` javascript
class InternalStorage {

	constructor(key) {
		this._storage = localStorage;
	}

	_serialize(data) {
		return JSON.stringify(data);
	}

	_deserialize(value) {
		return JSON.parse(value);
	}

	_getIndexKey() {
		return this._key + '-index';
	}

	getIndex() {
		var value = this._storage.getItem(this._getIndexKey());

		if (value) {
			return this._deserialize(value);
		}
		else {
			return [];
		}
	}

	setIndex(array=[]) {
		var obj = this._serialize(array);
		return this._storage.setItem(this._getIndexKey(), obj);
	}

}
```

Here is the converted code, using localForage:

``` javascript
class InternalStorage {

	constructor(key) {
		this._storage = localforage;
	}

	_serialize(data) {
		return data;
	}

	_deserialize(value) {
		return value;
	}

	_getIndexKey() {
		return this._key + '-index';
	}

	getIndex() {
		var self = this;

		return new Promise(function(resolve, reject) {
			self._storage.getItem(self._getIndexKey())
				.then((value) => { resolve(self._deserialize(value)); });
		});
	}

	setIndex(array=[]) {
		var obj = this._serialize(array);
		return this._storage.setItem(this._getIndexKey(), obj);
	}

}
```

The things to notice with the transition to localForage are:

- No requirement to serialise/deserialise, as localForage deals with this.
- localForage returns an ES6 Promise, so, so does `setIndex`.
- I've wrapped the logic for `getIndex` in a Promise, so I can keep my `_serialize` method in place. Well, you never know.

ES6 is a big thing for me at the moment, so the fact that localForage supports ES6 compliant promises, was very appealing. The ability to write additional adapters adds future proofing. My one gripe, which isn't an issue with localForage, is that we don't have a robust solution for relational storage in our web based development at the moment.