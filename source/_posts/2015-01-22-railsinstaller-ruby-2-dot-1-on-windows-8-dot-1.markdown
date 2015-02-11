---
layout: post
title: "RailsInstaller (Ruby 2.1) on Windows 8.1"
date: 2015-01-22 19:53:44 +0000
comments: true
categories: [ Rails, Windows, Node, Tips ]
---
I've recently had to get Rails and Capistrano up and running on a Windows 8.1 machine. These are the problems I encountered and how I fixed them. All issues were encountered after trying to run an existing Rails 4 project.

<!--more-->

My first step was to install Rails using [RailsInstaller](http://railsinstaller.org). This is a great first step for Windows users, as you also get Ruby, Git and DevKit (which is important for building gems that contain native code). I elected to install the Ruby 2.1 version, which at the time of install, was sporting Ruby 2.1.5.

##Invalid Certificate
When running `bundle`, I encountered the following error:

``` bat
Unable to download data from https://rubygems.org/ - SSL_connect returned=1 errno=0 state=SSLv3
```

As per the accepted answer on this [StackOverflow question](http://stackoverflow.com/questions/27435841/windows-7-64-bit-could-not-find-a-valid-gem-compass-0-here-is-why-unab), I downloaded [cacert.pem](http://curl.haxx.se/ca/cacert.pem) and placed it here, C:\RailsInstaller\. You also need to tell `gem` where to find the certificate, which is done by setting a environment variable called `SSL_CERT_FILE`. This can be done on a temporary basis by typing the following into Command Prompt":

``` bat
set SSL_CERT_FILE=C:\RailsInstaller\cacert.pem
```

##Sqlite Native
Running any command related to the local Sqlite db, threw up:

``` bat
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

``` bat
Error: ENOENT, stat 'C:\Users\[Username Here]\AppData\Roaming\npm
```

This issue was resolved by creating the missing `npm` folder in `Roaming`. Credit goes to the accepted answer of this [question](http://stackoverflow.com/questions/25093276/node-js-windows-error-enoent-stat-c-users-rt-appdata-roaming-npm).

##Capistrano
On the first day of setup, Capistrano worked like a dream. The following day, after a system restart, no dice. Capistrano tasks kept dying with the following:

``` bat
Error reading response length from authentication socket
```

I tried reinstalling certificates and ensured the SSH Agent was running, to no avail. I still don't completely understand the problem, but I think the solution has more to do with the PC's specific environment.

[SourceTree](http://www.sourcetreeapp.com/) was already installed (and running) on the PC, when I came to install Rails. As part of the installation, SourceTree installs [Pageant](http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html), a Windows based SSH authentication tool.

Basically, Capistrano started working again the moment I had the presence of mind to start Pageant again.

_NOTE: The PC has two sets of SSH keys setup, one through Pageant, the other through [Msysgit](https://msysgit.github.io/). I thought I'd been using the Msysgit key, but I suspect I was using the Pageant one all along. For Capistrano at least, Git works from the command line, regardless of the status of Pageant._

I'm not aware of any dependancy on Pageant by RailsInstaller. So I wonder whether I wouldn't have this dependancy now, if I didn't already have Pageant on the system. Or possibly, I'd have struggled getting Capistrano working at all, not appreciating the need for Pageant.

##Line Endings
I'm still not 100% clear what happened here. We manage a number of GIT repos on Windows & Mac and have not had this issue before. Upon committing changes to a project, from the Windows machine, all the line endings were converted to CRLF. This caused problems with Rake (the project in question was built in Rails). My inital attempts to fix the issue on a Mac resulted in me corrupting the Sqlite3 development database, so for the remainder of this fix, assume I've temporarily moved the db out of the directory structure.

From the project root, on a Mac, I ran the following:

``` shell
find . -type f -not -path "./.git/*" -exec perl -pi -e 's/\r\n|\n|\r/\n/g' {} \;
```

From Linux, you can run:

``` shell
find . -type f -not -path "./.git/*" -exec dos2unix {} \;
```

The above, replaces CRLF with LF for all files in the GIT repo.

After readding the database, I ran `rails server` to check for obvious issues and all seemed well. As per this [Github article](https://help.github.com/articles/dealing-with-line-endings/#platform-windows), I ran the following on the Windows machine:

``` bat
git config --global core.autocrlf true
```

The above, gets GIT to manage linee ndings on Windows machines, to keep them in sync with GIT's base line ending (LF).