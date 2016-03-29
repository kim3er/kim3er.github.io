---
layout: post
title: "Flexible Index Pages in Perch"
date: 2015-01-14 23:14:12 +0000
comments: true
categories: [ Perch, PHP ]
published: true
---
It's pretty easy to knock up an index page in Perch. By 'index page', I mean a page that summarises the content of a sub folder. For instance, you have a collection of projects, implemented as sub pages of a directory called 'projects'. You could provide a link to each of these projects on an index page.

<!--more-->

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
		<a href="/projects/project-1.php">Project 1</a>
	</li>
	<li>
		<a href="/projects/project-2.php">Project 2</a>
	</li>
</ul>
```

The `perch_pages_navigation` function uses the HTML template 'perch/templates/navigation/item.html' to generate the HTML above. This is a file that can be modified, or even replaced using the `template` option.

You're restricted in the content that can be displayed in this template. This is because of how data in Perch is grouped. Within a `perch_pages_navigation` template, you have access to data related to the page, like the title and path. But you don't have access to content regions, defined using `perch_content`, as this not information that is shared across all pages.

```
Page Content
	- pagePath <-- Can access this
	Region Content (as defined in a perch_content region)
		- some_content <-- Can't access this
```

As of Perch 2.4, you can extend the amount content saved at a page level, using [Page Attributes](/blog/2015/02/18/page-attributes-in-perch/). Page Attributes can be very useful, but they can't be used to be target a sub-sect of pages (like our project pages), so are not ideal for what we're trying to achieve. I.E You can only add fields that will be available to all pages.

_Update: This is not entirely true. You can set an 'Attribute template' per page, in 'Page Options'. Attribute templates allow you to decide which attributes are configurable at a page level. There is a draw back back though; the 'Attribute template' is not saved in a Master page. So it would be down to the user to configure the 'Attribute template' each page. Checkout my post of Page Attributes [here](/blog/2015/02/18/page-attributes-in-perch/)._

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
				'template' =>'project_item.html' // This region reuses data from target pages (image, excerpt)
			));

			$i = $i + 1;
		}
	?>
</ul>
```

The PHP above retrieves our list of pages using `perch_pages_navigation`, but this time skipping the template. Setting `skip-template` to `true`, bypasses the HTML rendering process and returns an array instead. The array itself is a list of all our project pages, including associated page data.

With the array in hand, we can apply it to a standard content region, allowing us to access project specific content. Within the `foreach` loop, we grab what we need from the page data (in this case `pagePath` and `pageNavText`). We'll need the `pagePath` value for two reasons; we'll need to know where we're linking too, but also we can use `pagePath` to summon up our project specific content. 

See this line below, it's instructing `perch_content_custom` to go to the project page for the content to populate our template ('project_item.html').

``` php
	'page' => $page['pagePath'], // The dynamic path to the page which contains the target region
```

That's really powerful, but I've skipped two things:

1. What does the 'Detail' region of the project page look like?
2. What does 'project_item.html' look like?

Where possible I tend to organise my page templates into as few content regions as possible, the primary region typically being called 'Detail'.

Let's assume we're project title is being inferred from the page title. Below is the Detail region ('project_detail.html'), which includes a description, an image and a list of features.

``` html
<div class="desc">
	<perch:content id="desc" type="textarea" label="Description" html="true" editor="ckeditor" imagewidth="640" imageheight="480" />
</div>

<div class="two-col">
	<div class="image">
		<img src="<perch:content type="image" id="image" label="Image" width="800" />" alt="<perch:content type="text" id="alt" label="Description" required="true" help="e.g. Photo of MD John Smith with his best wig on" title="true" />" />
	</div>
	<div class="feat">
		<ul>
			<perch:repeater id="features" label="Features">
				<li>
					<perch:content type="text" id="feature" label="Feature" />
				</li>
			</perch:repeater>
		</ul>
	</div>
</div>
```

_Since the inclusion of [Repeaters](http://docs.grabaperch.com/docs/templates/repeaters/) within content templates, it's become much easier to create self contained content regions. Before repeaters, the moment you hit an image gallery or feature list, you'd need to duck out of your primary content region and create a new repeating content region. Leading to fun naming conventions like 'Detail - Top' and 'Detail - Bottom', with 'Feature List' stuck in the middle._

We'll need to some an additional fields to 'project_detail.html',for us to access in the index page, a thumbnail and an excerpt:

``` html
	<perch:content id="thumbnail" type="image" label="Thumbnail" width="310" height="160" crop="true" required="true" help="Recommended image size: 310px wide & 160px high" suppress="true"/>
	<perch:content id="excerpt" type="textarea" label="Excerpt" html="false" imagewidth="640" imageheight="480" suppress="true" />
```

Both fields have `suppress` set to `true`, meaning that they fields available for input, but will not appear in the resulting HTML for the template. We want the use to be able to enter an excerpt, but we don't want the except to appear on the detail page.

So, what does 'project_item.html' look like? You can see it below:

``` html
	<article>
		<h2>
			<perch:content id="pageNavText" />
		</h2>
		<div class="project-thumb">
			<img src="<perch:content id="thumbnail" type="image" width="310" height="160" crop="true"/>" alt="" class="img-responsive" />
		</div>
		<div class="project-detail">
			<div class="excerpt">
				<p>
					<perch:content id="excerpt" type="textarea" />
				</p>
				
			</div>
			<a href="<perch:content id="pagePath" />">
				VIEW CASE STUDY
			</a>
		</div>
	</article>

```

The title is inferred from the `pageNavText` variable (set in the `foreach` loop), likewise the url comes from `pagePath`. The thumbnail and the except are retrieved using standard Perch content tags, as it is after all content being rendered using `perch_content_custom`.

Your resulting index page will look something like:

``` html
	<article>
		<h2>
			Project 1
		</h2>
		<div class="project-thumb">
			<img src="/images/project-1.jpg" alt="" class="img-responsive" />
		</div>
		<div class="project-detail">
			<div class="excerpt">
				<p>
					Project excerpt
				</p>
				
			</div>
			<a href="/projects/project-1.php">
				VIEW CASE STUDY
			</a>
		</div>
	</article>
	<article>
		<h2>
			Project 2
		</h2>
		<div class="project-thumb">
			<img src="/images/project-2.jpg" alt="" class="img-responsive" />
		</div>
		<div class="project-detail">
			<div class="excerpt">
				<p>
					Project 2 excerpt
				</p>
				
			</div>
			<a href="/projects/project-2.php">
				VIEW CASE STUDY
			</a>
		</div>
	</article>
```

As you can see above, we now have an index page with links to the sub pages, including a brief excerpt and a thumbnail for each.

The advantages of this solution are:

1. Because the solution uses  `perch_pages_navigation`, the page will honour Perch's ordering functionality. 
2. The use of `perch_content_custom` means that we can create fields specifically for use in project pages, that don't bloat the page data of non project pages.

The problem with the solution, is that multiple calls to the database are required to display the list. One to retrieve the navigation list, and then an additional call for each of the pages returned.

A solution that reduced the amount of database calls, while still harnessed the power of the Perch templating system, might to write a SQL statement manually, the joined the navigation `SELECT` statement to a statement retrieving the desired content data, then parsed each of the results through the templating system. This might be something I investigate, should the volume of sub pages, demonstrate a noticeable slowdown of load time.