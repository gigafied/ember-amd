define ([], function () {

	"use strict";

	if (!window.define || !window.Ember) {
		throw new Error("EMBER AMD expects window.define() and window.Ember to exist.");
	}

	var APP = null,
		APP_NAMESPACE = "",
		UNREGISTERED_MODULES = {};

	function upperFirst (s) {
		return s.charAt(0).toUpperCase() + s.slice(1);
	}

	function lowerFirst (s) {
		return s.charAt(0).toLowerCase() + s.slice(1);
	}

	function getConfig (id, module) {

		var config;

		if (!module || !module.isClass) {
			return {register : false};
		}

		config = Ember.copy(module.EMBER) || {};
		config.type = config.type || getEmberType(module);

		if (module.EMBER && Ember.isEqual(module.EMBER, module.superclass.EMBER)) {
			config = {type : config.type};
		}

		config.register = config.register === false ? false : !!config.type;

		config.name = config.name || getEmberName(config.type, id);

		return config;
	}

	function getEmberType (module) {

		var map,
			type,
			superClass;

		map = {
			"Ember.ArrayController" : "Ember.Controller",
			"Ember.ObjectController" : "Ember.Controller",
			"Ember.ContainerView" : "Ember.View",
			"Ember.CollectionView" : "Ember.View",
			"Ember.LinkView" : "Ember.View",
			"DS.Model" : "Ember.Model"
		};

		if (module && module.isClass) {
			superClass = module.superclass.toString().replace("(subclass of ", "").replace(")", "");
			superClass = map[superClass] || superClass;
			return superClass.toLowerCase().replace("ember.", "");
		}

		return false;
	}

	function getEmberName (type, id) {

		var p,
			l,
			name = [],
			parts = id.split("/");

		if (parts[0] !== APP_NAMESPACE) {
			return false;
		}

		parts.shift();

		p = parts[0];
		l = p.length - 1;

		if (p.charAt(l) === "s") {
			p = p.slice(0, l);
			if (p === type) {
				parts.shift();
			}
		}

		for (l = 0; l < parts.length; l ++) {
			parts[l] = lowerFirst(parts[l].replace(upperFirst(type), ""));
		}

		return parts.join(".");
	}

	function isUnderNamespace (ns1) {
		return ns1.indexOf(APP_NAMESPACE) === 0;
	}

	function getNamespace (id) {
		var a = id.split("/");
		a.pop();
		return a.join("/");
	}

	function registerUnregistered () {

		var p;

		if (require &&
			require.s &&
			require.s.contexts &&
			require.s.contexts['_'] &&
			require.s.contexts['_'].defined
		) {
			Ember.merge(UNREGISTERED_MODULES, require.s.contexts['_'].defined);
		}

		for (p in UNREGISTERED_MODULES) {
			register(p, UNREGISTERED_MODULES[p]);
		}

		UNREGISTERED_MODULES = {};
	}

	function register (id, module) {

		var config;

		if (!APP) {

			UNREGISTERED_MODULES[id] = module;

			if (module instanceof Ember.Application) {
				APP_NAMESPACE = getNamespace(id);
				APP = module;
				registerUnregistered();
			}
			return;
		}

		if (module && isUnderNamespace(getNamespace(id))) {

			config = getConfig(id, module);

			if (config.register) {
				//console.log(config.type, config.name);
				APP.register([config.type, config.name].join(":"), module, config.options || {});
			}
		}
	}

	window.define = (function (define) {

		return function (id, deps, factory) {

	        if (typeof id !== 'string') {
	            factory = deps;
	            deps = id;
	            id = null;
	        }

	        if (!deps instanceof Array || typeof deps.push !== "function") {
	            factory = deps;
	            deps = [];
	        }

	        deps.push("module");

	        factory = (function (factory) {

	        	return function () {

	        		var val,
	        			module = Array.prototype.splice.call(arguments, arguments.length-1, 1)[0];

	        		if (typeof factory === "function") {
        				factory = factory.apply(this, arguments);
	        		}

    				register(module.id, factory);

	        		return factory;
	        	}
	        })(factory);

			define.apply(this, id ? [id, deps, factory] : [deps, factory]);
		}
	})(window.define);


	Ember.Application.reopenClass({

		create : function () {

			var app,
				namespace;

			if (typeof arguments[0] === "string") {
				namespace = Array.prototype.splice.call(arguments, 0, 1)[0];
			}

			app = this._super.apply(this, arguments);

			if (!APP && namespace) {
				APP_NAMESPACE = namespace;
				APP = app;
				registerUnregistered();
			}

			return app;
		}
	});

	return Ember;

});