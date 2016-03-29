---
layout: post
title: "A punnet size guide to Git cherry picking"
date: 2015-04-25 10:10:55 +0100
comments: true
categories: [ Git ]
---

I'd just finished a load of work on a project. I'd made my commit and was a about to push to origin, when I noticed I was on the wrong branch.

_What a numpty._

Why this happened, is probably a good subject for another post. What I want to talk about is how I resolved the issue.

<!-- More -->

## Sitrep

The situation was that I had two branches; `develop`, my intended branch and `wrong-branch`, the branch I actually committed to. `wrong-branch` was the product of bad practice on my part, luckily it was up-to-date with `develop`, give or take a couple of small amends. `wrong-branch` had itself a number of commits, in amongst merges from the `develop`, that I didn't want merging back into `develop`.

```
----------------		develop
    \----\-----\---		wrong-branch
```

Ideally, I wanted to pick the very last commit on `wrong-branch` and append it to end of `develop`. The contents of the commit was mostly in isolation of the rest of the project, so I didn't expect any conflicts.

## Precautions

So, what did I do? Firstly, I took two precautionary steps:

### 1. Update `wrong-branch` with `develop`

I wanted to reduce the risk of conflict, so I made sure `wrong-branch` had the latest updates from `develop`.

``` bash
git checkout wrong-branch
git merge develop
```

### 2. Made a copy of `develop`, in case anything went wrong

``` bash
git checkout develop
git checkout develop-tmp
```

## First crack

Did I mention, that this is the first time I've attempted a cherry pick? In order to perform a cherry pick, you need the hash of the commit you want to grab. The hash will look something like  `d736fa95b41a36f5c59074afdbc773d60ca5a99b`, or the shortened version `d736fa9`. You can get this from `git log`.

``` bash
git checkout develop-tmp
git cherry-pick d736fa9
```

The second line of the example above resulted in the following error:

``` bash
... is a merge but no -m option was given.
```

## Getting it right

The `-m` option allows for a parent number. A commit's parent is essentially the commit's predecessor, usually the commit that spawned the current commit. On a branch, the parent number starts at 1, and increases as you go back along the tree. So, if you wanted to append the commit to the end of the branch, use '-m 1'.

Let's give it another go:

``` bash
git checkout develop-tmp
git cherry-pick -m 1 d736fa9
```

Huzzah! It worked. If you had any conflicts at this point, now is the time to resolve and commit. Then, all that is left, is to merge into the primary `develop` branch.

``` bash
git checkout develop
git merge develop-tmp
git branch -D develop-tmp
```

The end.