---
layout: post
title: "Page Attributes in Perch"
date: 2015-01-10 22:52:05 +0000
comments: true
categories: [ Perch, PHP ]
published: false
---

Page Attributes allow you to add editable content at the page level, rather than on a content level. The syntax is almost identical to that of a standard content region. Below is an extract of `perch/templates/pages/attributes/seo.html`:

``` html
<perch:pages id="description" label="Description" type="textarea" size="xs" escape="true" count="chars" />
```

<!--more-->

_If you're not already familiar with how to implement Page Attributes, I urge you to check out Perch's [docs](http://docs.grabaperch.com/docs/pages/page-attributes/). The implementation is simple, and as the builtin example suggests, very effective for SEO._

This is a somewhat contrived example, but should hopefully demonstrate the flexibility that page attributes add to Perch. Imagine a website that contains a list of projects. The home page contains a list of the titles of those projects, and a link to view more information. The list is generated using the [perch_pages_navigation](http://docs.grabaperch.com/docs/navigation/perch-pages-navigation/) function.

``` php
<?php perch_pages_navigation(array( 'from-path' => '*' )); ?>
```

We'd like the list to include a thumbnail and a small excerpt of the project description. I've already provided a [tutorial](/blog/2015/01/14/flexible-index-pages-in-perch/) of a flexible technique for achieving this, but perhaps it's a bit overkill for the immediate needs of the client. With Page Attributes we can fresh out our index page, with an image and an excerpt, with very little effort.

Adding the following to `perch/templates/pages/attributes/default.html`:

``` html
<perch:pages id="image" label="Image" type="image" />
<perch:pages id="excerpt" label="Excerpt" type="textarea" />
```

Adds two additional fields in the Page Details section of all pages.

![Page Attributes added](/images/page-attributes-1.png)

This new content is saved at a page level, so it can now be exposed in our index page using our existing `perch_pages_navigation` implementation. By modifying 'perch/templates/navigation/item.html' to the following:

``` html
<perch:before>
    <ul>
</perch:before>
		<li<perch:if exists="current_page"> class="selected"</perch:if><perch:if exists="ancestor_page"> class="ancestor"</perch:if>>
            <a href="<perch:pages id="pagePath" />">
            	<img src="<perch:pages id="image" />" alt="<perch:pages id="pageNavText" />">
            	<h1>
            		<perch:pages id="pageNavText" />
            	</h1>
				<p>
					<perch:pages id="excerpt" label="Excerpt" type="textarea" />
				</p>
            </a>   
            <perch:pages id="subitems" encode="false" />
        </li>
<perch:after>
    </ul>
</perch:after>
```

The outputted HTML of our index page would resemble:

``` html
<ul>
	<li>
		<a href="/industries/project-1.php">
			<img src="/perch/resources/project-thumb.jpg" alt="Project 1">
			<h1>
				Project 1
			</h1>
			<p>
				Project Excerpt
			</p>
		</a>
	</li>
</ul>
```

You can see how quickly we can expose, and gain access to, page level content with Page Attributes. This technique may well fit the bill for you immediate requirements. Before committing to this course of action over, say my previously mentioned tutorial, you should be aware of the following aspects of Page Attributes:

1. The new fields are hidden away in the Page Details tab. The content we enter for the index page, may have overlap with content being created for the project page. In this case it more sense to group all the content into content regions.
2. Page Attributes are shared across all pages, not just a targeted few. The Page Details could get awfully crowded with fields that are only applicable in niche circumstances. For instance, you also have a list of staff that require a job title field. This field would also be visible in the Page Details tab of a our project pages.
