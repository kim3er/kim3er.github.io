---
layout: post
title: "Flexible Index Pages in Perch"
date: 2015-01-08 10:05:12 +0000
comments: true
categories: [ Perch, PHP ]
published: false
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

As of Perch 2.4, the Perch team have an answer to this restriction, with the introduction of [Page Attributes](http://docs.grabaperch.com/docs/pages/page-attributes/). Page Attributes can be very useful, but they can't be used to be target a sub-sect of pages (like our project pages), so are not ideal for what we're trying to achieve.

What is needed is a mechanism, whereby the page order is retrieved from the Navigation part of Perch and the content, from a region designed with our projects in mind.

``` php
<ul>
	<?php
		$nav = perch_pages_navigation(array( // Return navigation pages data as array
			'from-path' => '*',
			'skip-template' => true
			));

		foreach($nav as $page) { // Loop through & customise each item returned in the array
			PerchSystem::set_var('pageNavText', $page['pageNavText']); // Grab the page title
			PerchSystem::set_var('pagePath', $page['pagePath']); // Find the correct links for each page
			perch_content_custom('Detail', array( // 'Detail' is the region containing the data we need - this is used in the target page template
				'page' => $page['pagePath'], // The dynamic path to the page which contains the target region
				'template' =>'industry_icon.html' // This region reuses data from target pages (image, excerpt)									
			));

			$i = $i + 1;
		}
	?>
</ul>
```

The PHP above retrieves our list of pages using `perch_pages_navigation`, but this time skipping the template. Setting `skip-template` to `true`, bypasses the HTML rendering process and returns an array instead. The array itself is a list of all our project pages, including associated page data.

Within the `foreach` loop, we grab what we need from the page data (in this case `pagePath` and `pageNavText`, 


