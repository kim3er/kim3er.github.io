---
layout: post
title: "RailsInstaller (Ruby 2.1) on Windows 8.1"
date: 2015-01-22 19:53:44 +0000
comments: true
categories: [ Rails, Windows, Node, Tips ]
---
I've recently had to get Rails and Capistrano up and running on a Windows 8.1 machine. These are the problems I encountered and how I fixed them. All issues were encountered after trying to run an existing Rails 4 project.

My first step was to install Rails using [RailsInstaller](http://railsinstaller.org). This is a great first step for Windows users, as you also get Ruby, Git and DevKit (which is important for building gems that contain native code). I elected to install the Ruby 2.1 version, which at the time of install, was sporting Ruby 2.1.5.

##Invalid Certificate
When running `bundle`, I encountered the following error:

``` bash
Unable to download data from https://rubygems.org/ - SSL_connect returned=1 errno=0 state=SSLv3
```

As per the accepted answer on this [StackOverflow question](http://stackoverflow.com/questions/27435841/windows-7-64-bit-could-not-find-a-valid-gem-compass-0-here-is-why-unab), I downloaded [cacert.pem](http://curl.haxx.se/ca/cacert.pem) and placed it here, C:\RailsInstaller\. You also need to tell `gem` where to find the certificate, which is done by setting a environment variable called `SSL_CERT_FILE`. This can be done on a temporary basis by typing the following into Command Prompt":

``` bash
set SSL_CERT_FILE=C:\RailsInstaller\cacert.pem
```

##Sqlite Native
Running any command related to the local Sqlite db, threw up:

``` bash
cannot load such file -- sqlite3/sqlite3_native
```

According to this [accepted answer](http://stackoverflow.com/questions/26636471/windows-ruby-rails-install-cannot-load-such-file-sqlite3-sqlite3-native), the problem is caused by the version of the `sqlite3` gem not supporting Ruby 2.1.3+ on Windows. The gem needed to be updated to at least 1.3.10.

##Bcrypt
I encountered a similar problem with the `bcrypt` gem. I didn't record the nature of the problem, but updating to at least 3.1.7 resolved the issue.

##TZInfo
When starting up the Rails server, I received an error relating to `TZInfo::DataSourceNotFound`. According to the accepted answer on this [question](http://stackoverflow.com/questions/23022258/tzinfodatasourcenotfound-error-starting-rails-v4-1-0-server-on-windows), Windows needs an additional gem for the `tzinfo` gem to work correctly. Add this to your `Gemfile`:

``` ruby
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw]
```

##NPM Error
For bonus points, I always install Node along with my Rails installations, if only for JavaScript compilation in Sprockets. Node is best installed using the binary from the official [website](http://nodejs.org/).

Typing `npm` into Command Prompt for the first time, returned the following:

``` bash
Error: ENOENT, stat 'C:\Users\[Username Here]\AppData\Roaming\npm
```

This issue was resolved by creating the missing `npm` folder in `Roaming`. Credit goes to the accepted answer of this [question](http://stackoverflow.com/questions/25093276/node-js-windows-error-enoent-stat-c-users-rt-appdata-roaming-npm).