### ember-amd

Easily use AMD and Ember together.

#### Why?

Ember is great, AMD is great. Wouldn't it be great if we could easily use both together without any headaches? That's where Ember AMD comes in.

Does this look familiar?

````js
// app/views/ExampleView.js

define([
		"Ember",
		"app/App"
	],

	function (Ember, App) {

		"use strict";

		App.ExampleView = Ember.View.extend({});
		
		return App.ExampleView;
		
	}
);
````

This repeats the same thing 3 times `app/views/ExampleView.js`, `App.ExampleView =` and `return App.ExampleView`. We want to kee things DRY right? If i change the name of this file I have to update it in 3 different places. 

Ember AMD lets you do this instead:


````js
// app/views/ExampleView.js

define([
		"Ember"
	],

	function (Ember) {

		"use strict";

	  return Ember.View.extend({});
		
  }
);
````

Nothing extraneous, nothing repeated.

#### Getting Started

	$ bower install ember-amd
	
or you can download [ember-amd.js](https://raw.github.com/gigafied/ember-amd/master/ember-amd.js) and save it to your project folder.

Setup your configuration to something like this. Anywhere you would normally list `Ember` as a dependency, use `ember-amd` instead. Here, we setup the path to `Ember` to actually point to `ember-amd` and define `Ember` as `EmberGlobal`. Doing it this way, we can easily plug this into an already existing Ember application that uses AMD.

##### Configuration
````js
require.config({

    paths: {
        "jQuery": "path/to/bower_components/jquery/jquery",
        "EmberGlobal" : "path/to/bower_components/ember/ember",
        "Ember" : "path/to/bower_components/ember-amd/ember-amd",
        "Handlebars": "path/to/bower_components/handlebars/handlebars"
    },

    shim: {

        "jQuery": {
            exports: "jQuery"
        },

        "Handlebars": {
            exports: "Handlebars"
        },

        "EmberGlobal": {
            deps: ["jQuery", "Handlebars"],
            exports: "Ember"
        },

        "Ember": {
            deps: ["EmberGlobal"]
        }
    }
});
````

##### Sample Application

````js

//app/App.js
define(

	[
		"Ember",
		"./routes",
		"./controllers",
		"./views",
		"./templates"
	],

	function (Ember) {

		"use strict";

		var App = Ember.Application.create("app");

		App.Router.map(function () {
			this.route("about");
			this.route("work");
			this.route("contact");
		});

		App.Router.reopen({
			location: 'history'
		});

		return App;
	}
);
````

Ember.`Application.create()` now expects an argument. That argument is the folder (or namespace) of the application. It's the folder where your `App.js` lives. This is the only change Ember Classes that Ember AMD makes.

You'll notice that we have additional dependencies of `routes`, `views`, `controllers` and `templates`. This is because there is no good way to automatically detect which files do/don't exist, so you still have to list them as a dependency somewhere. You can either do this straight in your `App.js`, or create separate files for each type of `Class` as we do here, and list those as dependencies here.
