---
layout: post
title: "Content Management With Perch"
date: 2011-03-04 04:22:42 +0000
comments: true
categories: [ Perch, PHP ]
---

> This is a repost of [http://dogma.co.uk/blog/1-content-management-with-perch](http://dogma.co.uk/blog/1-content-management-with-perch)

Perch, if you not already aware is a curious little PHP CMS by British design agency edgeofmyseat.com.  Curious because in an ecosystem dominated by feature rich, open source, free CMSs like WordPress and Drupal; Perch provides only one feature out of the box and costs about £40 per site including VAT. Curious because given this information, I'm still overwhelming drawn to Perch for a lot of my projects.

<!--more-->

Why I'm drawn to Perch is the simplicity of the CMS itself. [edgeofmyseat.com](http://edgeofmyseat.com/) have found niche between the handful of static HTML files in a directory and site built from the ground up to be content managed.

WordPress for instance, makes it very easy to create a very manageable site in minutes, literally. I dropped the folder on to my server, ran the installer and two minutes later I had a fully content managed site. Amazing, and with such a large community supporting WordPress I had customised the look, feel and function of my site with some of the thousands of free themes and plugins on offer.

But what about the site I already have? The individual HTML pages, strung together with anchor tags and a splash of PHP or similar as the contact form required it. Or the client who is intimidated (or just disinterested) with admin screens filled with Posts, Comments, Plugins and Tools?

If I was to content manage that static site with WordPress, I'd have to extract a template from the many pages built by my predecessors and create a theme. Assuming that is the pages have retained a uniform appearance over time. Then I manually recreate each of the pages in the CMS and create (or find equivalent) plugins for all the little bits of bespoke functionality that WordPress doesn't quite deal with. The horrible feeling that developers get when retreading old ground.

Or, you install Perch. Perch is designed to let you work the way you want. You create your pages, your structure, add your images and navigation. Out of the box, Perch does one thing really well. When you're creating your pages and you come across section that needs to be edited by the client, drop in a content tag.

``` php
<?php perch_content("Dynamic Content"); ?>
```

You also need to tell Perch to watch the page; you do this by adding the following line to the top of the page:

``` php
<?php include("../perch/runtime.php"); ?>
```

What happens is this; when you subsequently load that page. Perch queries the database to see if it has any content for page X called 'Dynamic Content'. If Perch doesn't have a content region in that location, it creates one. The next time you log into Perch, you'll be provided with a content region called 'Dynamic Content' flagged as new.

![Dynamic Content](/images/content-manage-perch-1.png)

Clicking on the region gives you the opportunity to define the content type from many built-in templates ranging from text to Google Analytics to images to blocks of code. If there isn't a template that suits your needs, create your own. You can also decide whether the content is recurring (like a list of posts) and whether content is to be shared between multiple pages.

So to go back to the example of that static site. Your client just wants to change the text on the front page, or update the news feed themselves. Just add a couple of PHP tags to the desired page, set the content type in the CMS and away you go. Replicating the existing news feed is as easy as copying one of the existing news items and pasting it into a new template, replacing the content with perch tags.

``` php
<perch:content id="heading" type="text" label="Heading" />
```

In summary, Perch is easy to setup (install process similar to WordPress) and makes it incredibly easy to add content management to existing sites on PHP capable web servers. Perch also contains an elegant API for extending the core functionality in the form of Apps. Apps available for download from the Perch site provide blogging functionality and dynamic page creation amongst other things. Hopefully I'll get a chance to cover Apps and App development in another post. If you regularly deal with legacy sites or just want to simplify things a bit, I recommend you check Perch out.