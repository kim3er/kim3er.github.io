---
layout: post
title: "Flexible Index Pages in Perch"
date: 2015-01-08 10:05:12 +0000
comments: true
categories: [ Perch, PHP ]
---
It's pretty easy to knock up an index page in Perch. By 'index page', I mean a page that summarises the content of a sub folder. For instance, you have a collection of projects, implemented as sub pages of a directory called 'projects'. You could provide a link to each of these projects on an index page.

The typical structure would be:

```
root
	projects
		index.php
		project-1.php
		project-2.php
```

The index itself would be provided by the `perch_pages_navigation` function. A basic example below:

``` php
<?php perch_pages_navigation(array( 'from-path' => '*' )); ?>
```

_The asterisk assigned to `from-path` tells `perch_pages_navigation` to work from the current directory ('projects')._

_More information on `perch_pages_navigation` can be found here, [perch_pages_navigation](http://docs.grabaperch.com/docs/navigation/perch-pages-navigation/)._

Would output:

``` html
<ul>
	<li>
		<a href="/industries/project-1.php">Project 1</a>
	</li>
	<li>
		<a href="/industries/project-2.php">Project 2</a>
	</li>
</ul>
```

The HTML is generated from the HTML template 'perch/templates/navigation/item.html'. This is a file that can be modified or even replaced, using the `template` option.

You're restricted in the content that can be displayed in this template. This is because of how data in Perch is grouped. Within a `perch_pages_navigation` template, you have access to data related to the page, like the title and path. However, you don't have access to content regions, defined using `perch_content`, as this not information that is shared across all pages.

```
Page Content
	- pagePath <-- Can access this
	Region Content (as defined in a perch_content region)
		- some_content <-- Can't access this
```

As of Perch 2.4, the Perch team have an answer to this restriction, with the introduction of [Page Attributes](http://docs.grabaperch.com/docs/pages/page-attributes/).

##Page Attributes
Page Attributes allow you to add editable content at the page level, rather than on a content level. The syntax is almost identical to that of a standard content region. Below is an extract of `perch/templates/pages/attributes/seo.html`:

``` html
<perch:pages id="description" label="Description" type="textarea" size="xs" escape="true" count="chars" />
```

_If you're not already familiar with how to implement Page Attributes, I urge you follow the link above. The implementation is simple, and as the builtin example suggests, very effective for SEO._

We can use Page Attributes to fresh out our index page, with an image and an excerpt.

Adding the following to `perch/templates/pages/attributes/default.html`:

``` html
<perch:pages id="image" label="Image" type="image" />
<perch:pages id="excerpt" label="Excerpt" type="textarea" />
```

Would add two additional fields in the Page Details section of all pages.

![Page Attributes added](/images/page-attributes-1.png)

We could the