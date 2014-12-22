---
layout: post
title: "Converting SVN to GIT"
date: 2012-11-25 20:36:00 +0000
comments: true
categories: [ Source Control, Terminal ]
---

> This is a repost of [http://dogma.co.uk/blog/10-converting-svn-to-git](http://dogma.co.uk/blog/10-converting-svn-to-git)

We've recently set about converting all our old SVN repositories to GIT. The process is quite easy thanks to the `git svn` command, but there are some gotchas. So, I'll detail the process below.

Every revision in a SVN repository has an author, these authors need to be migrated to the new GIT repository; which is done by compiling a text file listing the existing SVN username along with the author's new GIT equivalent. The format of the text file is as follows:

``` bash
svn_username = GIT User Name <user@dogma.co.uk>
```

You can list as many users in this file as you like, duplicating the GIT details if required. To generate a list of the SVN author's run the following with the SVN repo:

``` bash
svn log --xml | grep author | sort -u | perl -pe 's/.>(.?)<./$1 = /'
```

A potential gotcha here is that `git svn` will fail if the SVN username has spaces in it. This caught me out as our older SVN repos were originally hosted on a Visual SVN Server, which used the username `Visual SVN`.  If you have a username with spaces in it, you must change that username in each revision the author is attached to.

To identify the offending revisions, run:

``` bash
svn log | sed -n '/svn_username/,/-----$/ p'
```

Then to fix the username, run the following on each revision:

svn propedit svn:author -r revision --revprop svn_url
Once you have created an authors file (usually called authors.txt), run the following in an empty directory to clone the SVN repo into a new temporary GIT repo called `git-tmp`:

``` bash
git svn clone --stdlayout --no-metadata -A authors.txt svn_url git-tmp
```

Change directory into `git-tmp` and run the following to fetch the SVN repo structure:

``` bash
git svn fetch
```

Now you'll want to link the temporary repository to your destination remote GIT repo, by running the following:

``` bash
git remote add remote git_url
git push -u remote master
```

The commands above will only push the master (what was trunk) to the remote repo. Currently, any branches you have in the SVN repo only exist as remote references in `git-tmp`. To make these references local branches and then push them to the server, run the following for each branch you would like to keep:

``` bash
branch=branch; remote=remote; git checkout -b $branch remotes/$branch; git push -u $remote $branch; git checkout master
```

Providing all went well, you can now discard the temporary GIT repo and clone a fresh copy of your new remote GIT repo.