---
layout: post
title: "Knowing your craft to the rescue!"
date: 2015-02-12 07:21:23 +0000
comments: true
categories: [ Preprocessors, Rebuttal, Transpilers ]
published: true
---
Just finished reading [What Will Save Us from the Dark Side of CSS Pre-Processors?](http://alistapart.com/column/what-will-save-us-from-the-dark-side-of-pre-processors) on [A List Apart](http://alistapart.com/). I found the title and initial tone of the post confounding. And well, I probably read the post in the first instance, to shout down the wildly unfair negative connotations attached to preprocessors.

<!-- more -->

The thing is, I love preprocessors. I love them so much that I'm currently brewing a series of posts extolling the virtues of preprocessors. Then I'm faced by a post by A List Apart (a site I have a lot of respect for), apparently prophesying the demise of these little wonders. I couldn't let the post go, what if they were right?

After all, its up to all of us to constantly question everything we believe to be true. Right? Right.

The arguments set forth for the problems with preprocessors are:

1. [Unmindful use of preprocessors creates bloated output.](http://alistapart.com/column/what-will-save-us-from-the-dark-side-of-pre-processors#section2)
2. [By adding a layer of abstraction on the base syntax, you're essentially locking yourself into it's Domain-Specific Language (DSL).](http://alistapart.com/column/what-will-save-us-from-the-dark-side-of-pre-processors#section3)

Blaming the use of a preprocessor on the coder's own bad habits, is like blaming traffic cameras for speeding. To get the best out of a tool, you must use it correctly. I'm no shining example of this! I frequently try to nail pictures to the wall with a screwdriver; I'm forever using an unnecessary amount of nesting in my [Sass](http://thesassway.com/intermediate/avoid-nested-selectors-for-more-modular-css).

You can't deny 'lock-in' effort of adding a preprocessor to a project. In much the same way, you could argue that choosing to write an application in a language like [Ruby](http://en.wikipedia.org/wiki/Ruby_(programming_language)), locks the future development to the that language over say the base languages that Ruby is built on, like C or Java.

Well, that's not quite right, you could write a native extension for Ruby in C, if you wanted. Actually, this is why I use the SCSS syntax of Sass over SASS, and why I favour [6to5](https://6to5.org/) over [CoffeeScript](http://coffeescript.org/). In both examples you can make use of all the wonderful syntactic sugar that the preprocessors provide, or ignore all of it and write in the base syntax. Let us not forget that we're never ever actually locked in by a good preprocessor, as its sole purpose is to generate the base syntax, so you can opt out at any time. "Hey man, I don't need your syntactic goodness anymore, I'm going to carry on with the base file".

A couple of issues are raised by my last paragraph:

1. __I love Ruby for the same reason that I don't like CoffeeScript.__ This is a weirdness that actually Lyza (the original post's author) will be helping me with later in this post. I have no interest in writing a line of C. I adore JavaScript and have never warmed to CoffeeScript as an alternative.

2. __Why would you ever just  use the base syntax, if you'd gone to the trouble of adding a preprocessor in the first place?__ I'm completely non-dismissive of Lyza's arguments about the 'lock-in' effect, or as I've always thought of 'barrier to entry' or 'learning curve'. I work in a very talented dev team. We each come from different technological backgrounds and have our own preferences for tooling & technology. If I'm going to add a dependancy to the project, it better not be at the expense of a co-worker's ability to jump in.

Its at the point where Lyza starts talking about post-processors, that my angst starts to wain. I'd never heard of [PostCSS](https://github.com/postcss/postcss) or [Myth](http://www.myth.io/) and I'm pretty excited about both. I use [Compass](http://compass-style.org/) a lot; the moment that hooked me was realising that I didn't  have to hack around with nonsense bits of CSS, to add cross browser support for `inline-block`. Maybe though its time for a slightly different approach, in much the same way that I write ES6 compliant JavaScript and have a "preprocessor" called 6to5 convert it into something most browsers can work with (I realise I'm talking about ES5). Perhaps I should be writing compliant CSS3 and have one of these "post-processors" add all the "make it work in older browser" stuff.

_Note: I've used some of those double quotes divisively, I wonder if you noticed. It seems to me that the use of "pre" and "post" refers to the point at which the code is compliant to a standard. So, 6to5 is actually a post-processor. I went to the site for clarification. 6to5 actually refers to itself as a [transpiler](http://en.wikipedia.org/wiki/Source-to-source_compiler), which is a marvellous way of avoiding a distinction that I care very little about._

In summation, Lyza's point (I believe) is that transpilers aren't there to cover up poor code, that diversity in one's approach (especially within a team) is good. If I'm right, then I agree with her wholeheartedly in both regards. I don't agree with the negative connotations of so-called preprocessors & post-proprocessors to get to these points though.

For my own part, Lyza's post is identified the different tacks I have been taking in my usage of transpilers in JavaScript and CSS. Its time to harmonise, where possible, starting with standards code and have the transpiler make it dirty. I won't be giving up my nesting anytime soon though.