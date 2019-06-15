'use strict';
var minimatch = require('minimatch');

module.exports = function(options, foundEntries) {
  function include(entry) {
    var excluded = options.excludes.find(exclude => minimatch(entry, exclude));
    return !!excluded === false;
  }

  return function(tree) {
    var matchers = [];

    matchers.push({
      tag: 'base',
      attrs: {
        href: true,
      },
    });

    if (options.images) {
      matchers.push({
        tag: 'img',
        attrs: {
          src: true,
        },
      });
    }

    if (options.scripts) {
      matchers.push({
        tag: 'script',
        attrs: {
          src: true,
        },
      });
    }

    if (options.styles) {
      matchers.push({
        tag: 'link',
        attrs: {
          rel: 'stylesheet',
        },
      });
    }

    if (matchers.length) {
      tree.match(matchers, function(node) {
        switch (node.tag) {
          case 'base':
            var entry = node.attrs.href;
            if (include(entry)) {
              foundEntries.push([entry, 'base']);
            }
            break;
          case 'img':
            // Ensure we're not preloading an inline image
            if (node.attrs.src.indexOf('data:') !== 0) {
              var entry = node.attrs.src;
              if (include(entry)) {
                foundEntries.push([entry, 'image']);
              }
            }
            break;
          case 'script':
            var entry = node.attrs.src;
            if (include(entry)) {
              foundEntries.push([entry, 'script']);
            }
            break;
          case 'link':
            var entry = node.attrs.href;
            if (include(entry)) {
              foundEntries.push([entry, 'style']);
            }
            break;
          // no default
        }
        return node;
      });
    }

    return foundEntries;
  };
};
