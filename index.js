'use strict';

var postcss = require('postcss');
var functions = require('postcss-functions');
var consistent = require('consistent');
var url = require('url');

module.exports = postcss.plugin('prefix', function (options) {
  options = options || {};
  var prefix = options.prefix || '';
  var useUrl = options.useUrl || false;
  var exclude = options.exclude || null;

  if (Array.isArray(prefix)) {
    if (prefix.length === 1) {
      prefix = prefix[0];
    } else if (prefix.length === 0) {
      prefix = '';
    }
  }

  var ring;
  if (Array.isArray(prefix)) {
    ring = new consistent({
      members: prefix
    });
  }

  var getPrefix = function (path) {
    if (typeof prefix === 'string') {
      return prefix;
    }

    return ring.get(path);
  }

  var formatUrl = function (path, includePrefix) {
    includePrefix = typeof includePrefix !== 'undefined' ? includePrefix : true;
    var sanitizedPath = path.replace(/['"]/g, '');

    if ((exclude && exclude.test(path)) || /^([a-z]+:\/\/|\/\/)/i.test(path)) {
      includePrefix = false;
    }

    var prefix = includePrefix ? getPrefix(sanitizedPath) : '';

    return 'url('+url.resolve(prefix, sanitizedPath)+')';
  };

  return postcss().use(functions({
    functions: {
      cdn: function(path) {
        return formatUrl(path);
      },

      url: function(path) {
        return formatUrl(path, useUrl);
      }
    }
  }));
});
