---
layout: post
title: "Helpers as Partial Controllers"
date: 2015-01-31 18:08:46 +0000
comments: true
categories: [ Rails, Revelation, Partials ]
published: true
---
This is the first of what I expect will be a series of posts, about revelations that are entirely obvious in hindsight, but whose simplicity had eluded me for so long.

I came to Rails from ASP.NET MVC (have I told you about my [book](http://www.amazon.co.uk/ASP-Net-MVC-Cookbook-Andrew-Siemer/dp/1849690308)), as part of a three pronged transition:

1. Microsoft stack > Open source stack
2. IDE (VS2010) > Smart text editor (TextMate at the time, now Sublime Text 3)
3. Windows PC > Mac

The one thing I remember missing most when transitioning from ASP.NET MVC to Rails, was not being able to [render actions](http://haacked.com/archive/2009/11/18/aspnetmvc2-render-action.aspx/) within a view. I'm not going to regurgitate Phil Haack's example here (by the way, when did he start working at Github? He was part of my MS dream team). Basically, what we're talking about is rendering a partial that is attached to a controller. This way the logic is as portable as the partial itself, without putting logic into the actual partial; something I used a lot in ASP.NET MVC.

##Where there's a will there's a gem

When I'd convinced myself there wasn't a direct replacement for this functionality, I went about searching for a gem. What I found, was [Cells](https://github.com/apotonick/cells). This is about four years ago now, so I'm happy to see the gem is still so active. It is pretty much a direct replacement for the functionality I was looking for and I did use it for a few projects. Thing is though, it wasn't really clicking with the other Rails devs I was working with.

I think maybe it was an "against the grain", purest, "this isn't the Rails way" sort of reaction. But maybe they just saw what I couldn't; that there is a very easy way to accomplish my specific requirement. Either way, after the initial surge of wanting to use every gem under the sum, you gradually begin wanting to slim down your dependancies, and well, Cells didn't make the cut.

##So, to the point. Helpers

Oh my god, it's so obvious now. For years I was ruefully sticking logic directly into my partial views, thinking "Well, if I can't render actions, what else can I do?". What a doofus.

On a recent project, I was tired of the `locals` syntax of a partial I was using quite a lot.

``` ruby
render( partial: "path/to/partial", locals: { param_one: "something" } )
```

Really tiresome, I know. Anyway, as the partial was being used more, the logic being stuck into said partial was also increasing exponentially.

``` erb partial.html.erb
<%
param_three = false unless defined?( param_three )

if param_two == "Something"
	param_one = "Something incredibly hideous"
end
%>
<p class="<%= "yuck" if param_three == true %>>
	<%= "#{param_two} - #{param_one}" %>
</p>
```

In spite of the disgrace my partial had become, what really irked me was having to type in `locals` every time I rendered the partial. "I know, I'll put it into a helper method", I thought.

``` ruby something_helpers.rb
module SomethingHelpers

	def render_something(param_one, param_two, param_three = false)
		render( partial: "path/to/partial", locals: { param_one: param_one, param_two: param_two, param_three: param_three })
	end

end
```

And then the revelation, "Hang on a minute, I can put my logic in here as well". Hello.

``` ruby something_helpers.rb
module SomethingHelpers

	def render_something(param_one, param_two, param_three = false)
		if param_two == "Something"
			param_one = "Something incredibly hideous"
		end

		text = "#{param_two} - #{param_one}"

		render( partial: "path/to/partial", locals: { text: text, param_three: param_three })
	end

end
```

``` erb partial.html.erb
<p class="<%= "yuck" if param_three == true %>>
	<%= text %>
</p>
```

Seriously, sometimes I worry about me. I think I probably have this revelation every six months or so, then forget it. Hopefully after writing this, I won't forget again.