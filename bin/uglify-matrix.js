#! /usr/bin/env node
var path = require('path');
var uglify = require('../src/index.js');

function help() {
  var str = 'uglify\r\n\r\n'
    + '  uglify somefile matrix:debug --define DEBUG=true --compress matrix:min --define DEBUG=false\r\n\r\n'
    + '  Dont support uglify short tag line -d (short for --define)\r\n'

    console.log(str);
}

var matrix = {};
var commonOpts = {};

var ref = commonOpts;
var file = process.argv[2];
if (file) file = path.resolve(file);

var lastKey = null;

process.argv.slice(3).forEach(function (arg) {
  if (/^matrix:(.+)$/.test(arg)) {
    var key = RegExp.$1;
    matrix[key] = ref = {};
  } else if (ref) {
    if (arg[0] === '-') {
      lastKey = arg.replace(/^--?/, '');
      ref[lastKey] = true;
    } else {
      ref[lastKey] = parseArg(arg);
    }
  }
});


function parseArg(arg) {
  if (arg.indexOf('=') > 0) {
    return arg.split(',').reduce(function (res, curr) {
      var value = curr.split('=')[1];

      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (value === 'null') value = null;

      res[curr.split('=')[0]] = value;
      return res;
    }, {});
  } else {
    return arg;
  }
}

if (process.argv[3] === 'defined') {
  uglify(file, {

    'dev.debug': {
      define: {
        __DEBUG__: true,
        __PROD__: false,
        __DEV__: true
      },
      quotes: 1,
      beautify: true,
      compress: {
        warnings: false,
        hoistFuns: false,
        sequences: false
      },
      mangle: false
    },

    'prod.debug': {
      define: {
        __DEBUG__: true,
        __PROD__: true,
        __DEV__: false,
      },
      compress: {
        deadCode: true,
        unused: true,
        warnings: false,
        dropConsole: false,
        dropDebugger: false
      }
    },

    min: {
      define: {
        __DEBUG__: false,
        __PROD__: true,
        __DEV__: false,
      },
      compress: {
        deadCode: true,
        unused: true,
        warnings: false,
        dropConsole: true,
        dropDebugger: true
      }
    }
  }, {});
} else if (!Object.keys(matrix).length) {
  help();
} else {
  uglify(file, matrix, commonOpts);
}


