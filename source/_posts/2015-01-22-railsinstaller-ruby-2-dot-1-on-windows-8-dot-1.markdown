---
layout: post
title: "RailsInstaller (Ruby 2.1) on Windows 8.1"
date: 2015-01-22 09:41:44 +0000
comments: true
categories: [ Rails, Windows, Node, Tips ]
---
I've recently had to get Rails and Capistrano up and running on a Windows 8.1 machine. These are the problems I encountered and how I fixed them. All issues were encountered after trying to run an existing Rails 4 project.

My first step was to install Rails using [RailsInstaller](http://railsinstaller.org). This is a great first step for Windows users, as you also get Ruby, Git and DevKit (which is important for building gems that contain native code). I elected to install the Ruby 2.1 version, which at the time of install, was sporting Ruby 2.1.5.

http://stackoverflow.com/questions/27435841/windows-7-64-bit-could-not-find-a-valid-gem-compass-0-here-is-why-unab

##Sqlite Native
Running any command related to the local Sqlite db, throw up:

``` bash
cannot load such file -- sqlite3/sqlite3_native
```

According to this [accepted answer](http://stackoverflow.com/questions/26636471/windows-ruby-rails-install-cannot-load-such-file-sqlite3-sqlite3-native), the problem is caused by the version of the `sqlite3` gem not supporting Ruby 2.1.3+ on Windows. The gem needed to be updated to at least 1.3.10.

##Bcrypt
I encountered a similar problem with the `bcrypt` gem. I didn't record the nature of the problem, but updating to at least 3.1.7 resolved the issue.

##TZInfo
When starting up the Rails server, I received an error relating to `TZInfo::DataSourceNotFound`.

Make sure `brcypt` and `sqlite` are updated. Get min versions.

add this gem. gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw]

http://stackoverflow.com/questions/23022258/tzinfodatasourcenotfound-error-starting-rails-v4-1-0-server-on-windows

http://stackoverflow.com/questions/26636471/windows-ruby-rails-install-cannot-load-such-file-sqlite3-sqlite3-native

Install Node!

http://stackoverflow.com/questions/25093276/node-js-windows-error-enoent-stat-c-users-rt-appdata-roaming-npm