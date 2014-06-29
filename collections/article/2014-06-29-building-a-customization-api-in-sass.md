---
codepen: false
comments: false
date: 2014-06-29
disqus: false
guest: "Ezekiel Gabrielse"
layout: post
preview: true
published: true
sassmeister: true
summary: false
title: "Building a customization API in Sass"
---

> I am glad to have [Ezekiel Gabrielse](http://ezekielg.com/) today, dropping some Sass knowledge on how to build a powerful Sass API to customize the feel and look of elements. Fasten your belts boys, this is quite intense!

Hey guys! I am the creator of a relatively new Sass grid-system called [Flint](https://github.com/ezekg/flint), and a lightweight Compass extension called [SassyExport](https://github.com/ezekg/SassyExport), which we will be discussing throughout this series.

Since I already mentioned the word *series*, this article will be part of a 2 part series I will be doing. Today we're going to create a Sass-powered customization API that will be able to be tied into a front-end API, such as a Wordpress theming framework or even allowing live customization through JS. 

Today's discussion will focus on the Sass part, but it will flow straight into part 2 of this series, where we will be utilizing a brand new tool I developed called [SassyExport](https://github.com/ezekg/SassyExport), which allows you to *export* JSON *from* Sass and write it into a new file to use elsewhere if your projects.

## How does it work?

**Our Sass-powered customization API** will be able to essentially *mark* elements within our stylesheet that we want to customize, and which of that element's *properties* may be customized, as well as which default *values* will be used if these elements have not been modified. 

To be able to track all this stuff, we are going to use Sass maps to sort the output of this API by selector. Within that selector's map, we'll not only list its customizable properties but also the defaults for its values in case the user has not modified those.

We are going to do this all within Sass, and as we will discuss in part 2 of the series, a language like PHP or JS can hook in to our Sass-API and use the data to modify our stylesheet for these specific `$selector->$property` relationships. For the sake of time, we're going to keep this project simple and only stick to color customization. 

Therefore, we will create a color palette as a map, in order to pull *values* from it. That way we can also hook into this palette *module* through our front-end API and then allow the user to modify the original color palette, be it 2 colors, or even 42 colors. 

Furthermore, because we'll be keeping track of which selectors are using which color (or if we're getting really technical &mdash; which *sub-module*), we can then update their values if the user ever modifies that sub-module's color *value*.

### Okay, let's sum up

**We need to create a global variable for our color palette.**

* The palette naming convention should be semantic. For instance, we'll prefer *primary* and *complementary* to *red* and *blue*.
* The code itself needs to be modular and flexible, allowing the user to create a color palette of any scale. 

**We need to keep another global variable of all customizable elements with the following data:**

* the full selector name (kind of `&`);
* its customizable properties;
* default values for each property.

**We also need to output these default values into our stylesheet, that way our mixin will have two purposes: serve as our customization API and a way to retrieve our color palette to use within the actual stylesheet.**

## What we want? API!

*Throughout this article I will be using another project of mine called [Flint](https://github.com/ezekg/flint) as a base. It has various helper-functions that we will be using such as `selector_string()`, a Ruby function returning a stringified version of the current selector (`&`) so that we can use it in interpolation (which currently isn't possible). As well as a few others such as `exists()`, `is-map()`, `is-list()` and `map-fetch()`. They are all self-explanitory, but I just wanted to clarify before causing any confusion.*

This is the end result of what we will be building today. Take a look at the code, and follow along as we go through creating this API and understanding the methodology behind it, if that's your thing.

<p class="sassmeister" data-gist-id="ccf842e5ee74287f1868" data-height="480"><a href="http://sassmeister.com/gist/ccf842e5ee74287f1868">Play with this gist on SassMeister.</a></p>

## Building our palette

Firstly, let's create the map for our color palette setup. Like we decided above, let's keep the names of the *"keys"* semantic. That way we could potentially even pull in the palette *"keys"* when buidling the front-end customization API, as to not limit the creator of the palette to simply *"primary"* and *"complementary"* as names. 

I'm also going to keep our colors in a map called *"palette"* so we can keep our main API's code more modular to allow it to work with customizable properties other than just modifying colors.

```scss
// Customization module defaults
$customizer: (
	"palette": (
		"primary": (
			"lightest": #eff3d1,
			"light": #bbdfbc,
			"base": #8bb58e,
			"dark": #0b3c42,
			"darkest": #092226,
		),
		"complementary": (
			"light": #f6616e,
			"base": #f2192c,
			"dark": #b40a19,
		),
		"gray": (
			"light": #819699,
			"base": #4b5557,
			"dark": #333a3b,
		),
		"black": #131517,
		"white": #f2f9ff,
	),
) !global;

// Global variables
$customizer-instances: () !global;
```

As you can see, we have a pretty simple map of our default color palette to use within our customization API. I also created another global variable called `$customizer-instances` that will keep a record of all the data from each use of the API. It's an empty map for now. 

So, let's go ahead and move on to the next step, which is fleshing out the bones of our main mixin that we will be using to drive the API.

## Building our API's driver

Before we go any further, let's decide on how we want our API to work. To be able to jump right into the code in the rest of this article, this is what our syntax is going to look like at the end:

```scss
.selector {
	@include customizer($args: (
		color: "white",
		background: "primary" "darkest",
		border-color: "complementary" "base",
	), $uses: "palette");
}
```

In order to make the API easy to use and as close to the usual CSS syntax as possible, we're going to require the first argument to be a map called `$args` so that we can use `$key->$value` pairs for each customizable property, as well as allowing multiple properties to be passed to a single instance of the mixin. 

*Note: If you're unfamiliar with using maps as arguments, [Hugo just wrote up a pretty nifty article on that](http://www.sitepoint.com/using-sass-maps/), as well as many other use-cases for maps.*

The next argument will be fetching a module from within the above `$customizer` map, which in this case will be our *"palette"* module. We'll call this argument `$uses`, as we will be fetching (*using*) values from it for use in our first argument, `$args`.

I also want to make it fall back to outputting plain CSS if no module to use is specified, rather than erroring out we can simply `@warn` the user that the mixin shouldn't be used that way. Therefore, our API will be less frustrating to newer users that don't happen to be using it correctly.

```scss
// Create new customizable properties, save to instance map
// 
// @param {Map}           $args         - map of customizable property->value pairs
// @param {String | Null} $users (null) - module to pull property values from
// 
// @output $property->$value pairs for each argument

@mixin customizer($args, $uses: null) {
  
	// Make sure argument is a map
	@if is-map($args) {

		// Use module? Expecting module to exist
		@if $uses != null {

			// Check if module exists
			@if exists($customizer, $uses) {

				// ... All is safe, let's work with the arguments

      } 

			// Module did not exist, throw error
      @else {
				@warn "Invalid argument: #{$uses}. Module was not found.";
			}

    } 

		// No module specified, expecting plain CSS
    @else {

			// ... Since we'll be expecting valid CSS, let's output it here

			// Warn that customization mixin shouldn't be used without a module
			@warn "The customization mixin should not be used without specifying a module to use.";
		}

  } 

	// Argument was not a map, throw error
  @else {
		@warn "Invalid argument: #{$args}. Argument type is not a map.";
	}
}
```

I've commented the above code, but let's go ahead and dig a little deeper into the structure of the mixin. Like I said above, the first thing we should do is check that the `$args` argument is a map, and depending on the result, we'll either throw an error, or move on.

Next, let's check if a module was passed as the `$uses` argument; if not, let's output any `$key->$value` pairs as plain CSS. Also we will throw a warning to the user to let him know that the mixin shouldn't be used for plain CSS output. If a module was passed, let's move on to check whether or not the module actually exists within our `$customizer` variable (the palette map), like before we will either error out with a warning, or move forward.

Now, since we want to be able to pass multiple customizable properties into a single instance of the mixin, we need to iterate over each of those arguments. So, from within our conditional statement that checks whether or not the module exists, let's add the following code:

```scss
// @if exists($customizer, $uses) {

	// Run through each argument individually
	@each $arg in $args {
		// Break up argument into property->value
		$property: nth($arg, 1);
		$value: nth($arg, 2);

		// Get values from module
		@if is-list($value) or exists($customizer, $value) {
			$value: // ... We need to fetch the values from our module here;
		}

		// Output styles
		#{$property}: $value;
	}

// } @else module did not exist
```

In order to loop through each argument, let's use an `@each` loop. Within the loop, we'll define the `$property` and `$value` using the `nth()` function. Then, we're going to check if `$value` is either a list (when we're fetching the value from a deeper sub-module such as *"primary"*), or that the module exists (for values that don't have additional sub-modules, but rather a single value such as *"white"*). Assuming this check returns true, we need a way to fetch these values from their deeper sub-modules; so let's create a function for that called `use-module()`.

## Fetching our colors

The function is going to take two arguments, fairly similar to the arguments our main mixin takes. The first argument is a list of `$args`, which we will use to fetch the value from the module we passed into `$use` in the main mixin. 

Which brings us to the second argument! Since the function needs to know which module it's fetching from, let's create an argument called `$module`.

```scss
// Return value for property based on passed module
// 
// @param {List}   $args   - list of keys for customizable property
// @param {String} $module - module to pull property values from
// 
// @return {*} - $value from $module

@function use-module($args, $module) {
	// Make sure all submodules exist
	$exists: true;
	// Grab length of arguments
	$length: length($args);

	// Break down arguments into list to pass into map-fetch
	@each $arg in $args {
		$module: append($module, $arg);
	}

	// Check if sub-modules exist
	@if $length > 1 {
		@for $i from 1 through $length {
			@if not exists($customizer, nth($args, $i)) {
				$exists: false;
			}
		}
	}

	@if $exists {
		// Grab value from module by passing in newly built list
		@return map-fetch($customizer, $module);
	} 

  @else {
		// One or more of the modules were not found, throw error
		@warn "Invalid arguments: #{$module}. One or more module or sub-module not found.";
		@return $exists;
	}
}
```

Firstly, we're going to create a variable called `$use` and it's going to start with the `$module` we pass into the function, but will later be turned into a list of all arguments. 

The reason we're doing it this way is that if we simply passed these variables as-is into the `map-fetch()` function, it would error out because we're attempting to pass in a string, as well as a list instead of just a single list of arguments. This way, we can build the argument out as a space-seperated list (`$use`) that we will then pass into the function all at once.

You can also see that I'm doing a few simple checks to make sure every module and sub-module exists within `$customizer` map. If the argument was only a single value, then our check from the main mixin (before we even enter the function) will do just fine, but if we're fetching from additional sub-modules, we need to make sure those exist so that we don't get any error that would make the compilation crash.

So, our code is fully functional right now, but we haven't kept a record of any of the data we passed, or what selectors and which of it's properties are customizable. So, let's go ahead and create the function needed to do that.

## Creating our instance map

If you remember at the beginning of this article we created a global variable called `$customizer-instances`, but it was just an empty map. Like I said earlier, we're going to use that variable to house each instance of the mixin and keep track of the selector, which modules it uses, all of it's customizable properties as well as their default values.

The function will be called `new-customizer-instance()`. It will take two arguments indentical to the arguments that the main `customizer()` mixin takes, and for good reason: we're essentially going to loop over the arguments the exact same way, but instead of outputting styles for the selector, we're going to save these variables to an `$instance` map with the selectors name as the top-most key.

```scss
// Create new customizable instance
// 
// @param {Map}    $args   - map of customizable property->value pairs
// @param {String} $module - module to pull property values from
// 
// @return {Map} updated instance map

@function new-customizer-instance($args, $module) {
	// Define static selector
	$selector: selector-string(); // Flint Ruby function
	// Empty argument map
	$instance-properties: ();

	// Run through each argument individually
	@each $arg in $args {
		$property: nth($arg, 1);
		$value: nth($arg, 2);

		// Build temp map to merge into $instance-properties for each property
		$temp: (
			"#{$property}": (
				"module": $module,
				"value": $value,
			),
		);

		// Merge into argument map
		$instance-properties: map-merge($instance-properties, $temp);
	}

	// Create new instance map for selector, save properties
	$customizer-instance: (
		"#{$selector}": (
			$instance-properties,
		)
	);

	// Merge into main map
	@return map-merge($customizer-instances, $customizer-instance);
}
```

As you can see, we're using the Ruby function I talked about ealier called `selector-string()`, which outputs a stringified version of the `&` operator in Sass. That way we can work with the selector the same way we would with any other string, which currently isn't possible when using the normal `&` operator. You can read more about that issue [here](https://gist.github.com/nex3/8050187).

Next, we're going to create an empty map that is going to contain each customizable `$property` and all of the data for it such as its `$module` and the `$value` that is used from the module. Unlike the main mixin, we're not going to keep track of what styles are actually outputted, but rather where those styles came from within our module (*"palette"*). That way, if say, the *"primary" "base"* color changes via our front-end API, we know that this element is using that value, so we can then update the stylesheet to reflect the change.

But, as we can tell from the function above, it's returning a merged map, but we haven't actually told the new map to override the global `$customizer-instances` variable. Instead of making the function do that, let's create a mixin to handle that part so we can simply include it into the main mixin where we need to. That way, if we ever needed to make small minor adjustments, we only have to update it in one area. This next mixin is going to be rather simple.

```scss
// Create new customizable instance
// 
// @param {Map}    $args   - map of customizable property->value pairs
// @param {Module} $module - module to pull property values from
// 
// @return {Map} - updated instance map
 
@mixin new-customizer-instance($args, $module) {
	$customizer-instances: new-customizer-instance($args, $module) !global;
}
```

All that this mixin is doing, is taking the updated instance map from the `new-customizer-instance()` function, and setting the global `$customizer-instances` variable to reflect that update.

## Putting it all together

Going back to our main `customizer()` mixin, let's update the code to include all of our new functions.

```scss
// Create new customizable properties, save to instance map
// 
// @param {Map}           $args        - map of customizable property->value pairs
// @param {String | Null} $uses (null) - module to pull property values from
// 
// @output $property->$value pairs for each argument

@mixin customizer($args, $uses: null) {

  // Make sure argument is a map
  @if is-map($args) {

    // Use module? Expecting module to exist
    @if $uses != null {

      // Check if module exists
      @if exists($customizer, $uses) {

        // Save arguments to instance map
        @include new-customizer-instance($args, $uses);

        // Run through each argument individually
        @each $arg in $args {
          // Break up argument into property->value
          $property: nth($arg, 1);
          $value: nth($arg, 2);

          // Check if sub-module exists
          @if is-list($value) or exists($customizer, $value) {
            // Get values from sub-module
            $value: use-module($value, $uses);
            // Sub-module did not exist, throw error
          } 

          @else {
            @warn "Invalid argument: #{$value}. Sub-module was not found.";
          }

          // Output styles
          #{$property}: $value;
        }

      } 

      // Module did not exist, throw error
      @else {
        @warn "Invalid argument: #{$uses}. Module was not found.";
      }

    } 

    // No module specified, expecting plain CSS
    @else {

      // Loop through each argument individually
      @each $arg in $args {

        // Break up argument into property->value
        $property: nth($arg, 1);
        $value: nth($arg, 2);

        // Output styles
        #{$property}: $value;
      }

      // Warn that customization mixin shouldn't be used without a module
      @warn "The customization mixin should not be used without specifying a module to use.";
    }

  } 
    
  // Argument was not a map, throw error
  @else {
    @warn "Invalid argument: #{$args}. Argument type is not a map.";
  }
}
```

## The result

Above, I simply added in our new functions, and if all went well, our code should be fully functional.

```scss
.selector {
	@include customizer($args: (
		color: "white",
		background: "primary" "darkest",
		border-color: "complementary" "base",
	), $uses: "palette");
}
```

Everytime the `customizer()` mixin is run, a new instance is created with all of the needed data.

```scss
// Updates the global instance map with the new selector,
$customizer-instances: (
	".selector": (
			"color": (
				"module": "palette",
				"value": "white",
			), 
			"background": (
				"module": "palette",
				"value": ("primary", "darkest"),
			),
			"border-color": (
				"module": "palette",
				"value": ("complementary", "base"),
			),
		),
	),
);
```

Then the new styles are fetched and outputted into the stylesheet.

```scss
// And outputs the selectors styles from our module,
.selector {
	color: #f2f9ff;
	background: #092226;
	border-color: #f2192c;
}
```

## Final Thoughts

Now that we have these variables (`$customizer` and `$customizer-instances`) containing a wealth of useful data, in part 2 we'll walk through the basic syntax for [SassyExport](https://github.com/ezekg/SassyExport) and how we're going to use it to export all of this data into JSON. We will also discuss the various ways for this data to give opportunity to create some pretty impressive features when coupled with other languages, such as PHP.

Until next time, you can play with the customization API on [SassMeister](http://sassmeister.com/gist/ccf842e5ee74287f1868), check out [SassyExport on Github](https://github.com/ezekg/SassyExport), or [download the gem](http://rubygems.org/gems/SassyExport) to use with Compass in your own project.

> Ezekiel Gabrielse is a [recent designer-turned-developer](http://ezekielg.com/2014/05/07/the-unintended/) based in north Texas currently employed at [Produce Results](http://produceresults.com/) as a developer, and on the odd day, designer. You should definitely follow him on [Twitter](https://twitter.com/ezekkkg).
