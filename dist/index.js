'use strict';var _typeof='function'==typeof Symbol&&'symbol'==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&'function'==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?'symbol':typeof a};Object.defineProperty(exports,'__esModule',{value:!0});exports.pack=pack,exports.unpack=unpack;function isEncodedObject(a){return Array.isArray(a)&&'number'==typeof a[0]&&0!==a[0]}function pack(a){function b(g){if('object'!==('undefined'==typeof g?'undefined':_typeof(g))||!g)return g;return Array.isArray(g)?c(g):d(g)}function c(g){var h=g.length,l=[];if(0===h)return[];'number'==typeof g[0]&&l.push(0);for(var n,m=0;m<h;m+=1){n=g[m];var o=b(n),p=l[l.length-1];isEncodedObject(o)&&Array.isArray(p)&&o[0]===p[0]?l[l.length-1]=p.concat(o.slice(1)):l.push(o)}return l}function d(g){var h=Object.keys(g).sort();if(0===h.length)return{};var l,m=h.length+':'+h.join('|'),n=e[m];if(n){l=[n];for(var p,o=0;p=h[o++];)l[o]=b(g[p])}else{e[m]=++f,l={};for(var p,o=0;p=h[o++];)l[p]=b(g[p])}return l}var e={},f=0;return b(a)}function unpack(a){function b(l){if(0===l.length)return[];return 0===l[0]||'number'!=typeof l[0]?c(l):d(l)}function c(l){for(var m=l.length,n=[],o=0===l[0]?1:0;o<m;o+=1){var p=l[o],q=f(p);isEncodedObject(p)&&Array.isArray(q)?n=n.concat(q):n.push(q)}return n}function d(l){var m=g[l[0]],n=m.length,o=(l.length-1)/n,p;if(1<o){p=[];for(var t,s=0;s<o;s+=1){t={};for(var w,u=0;w=m[u++];)t[w]=f(l[s*n+u]);p.push(t)}}else{p={};for(var r,q=0;r=m[q++];)p[r]=f(l[q])}return p}function e(l){var m=Object.keys(l).sort();if(0===m.length)return{};h+=1,g[h]=m;var n={};return m.forEach(function(o){n[o]=f(l[o])}),n}function f(l){if('object'!==('undefined'==typeof l?'undefined':_typeof(l))||!l)return l;return Array.isArray(l)?b(l):e(l)}var g={},h=0;return f(a)}exports.default={pack:pack,unpack:unpack};