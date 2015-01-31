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

_If you're not already familiar with how to implement Page Attributes, I urge you follow the link above. The implementation is simple, and as the builtin example suggests, very effective for SEO._

We can use Page Attributes to fresh out our index page, with an image and an excerpt.

Adding the following to `perch/templates/pages/attributes/default.html`:

``` html
<perch:pages id="image" label="Image" type="image" />
<perch:pages id="excerpt" label="Excerpt" type="textarea" />
```

Would add two additional fields in the Page Details section of all pages.

![Page Attributes added](/images/page-attributes-1.png)

This new content is saved at a page level, so it can now be exposed in our index page. By modifying 'perch/templates/navigation/item.html' to the following:

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

This definitely a leap forward in the way we can expose page level content, but it's not ideal in a couple of respects:

1. The new fields are hidden away in the Page Details tab. The content we enter for the index page, may have overlap with content destined for the detail page.
2. Page Attributes are shared across all pages, not just a targeted few. The Page Details could get awfully crowded with fields that are only applicable in niche circumstances.
