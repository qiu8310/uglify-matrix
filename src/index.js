var path = require('path');
var cp = require('child_process');

var assign = require('lodash.assign');

var pkg = require('uglify-js/package.json');
var uglify = require.resolve('uglify-js/' + pkg.bin.uglifyjs);

module.exports = function (file, matrix, options) {
  matrix = matrix || {};
  options = assign({
    compress: true,
    mangle: {warnings: false, dropConsole: true}
  }, options);

  var dirname = path.dirname(file);
  var basename = path.basename(file);

  if (!Object.keys(matrix).length) {
    matrix.min = {
      mangle: {
        deadCode: true,
        unused: true,
        warnings: false,
        dropConsole: true
      }
    };
  }

  Object.keys(matrix).forEach(function (key) {
    var matrixOpts = assign({}, options, matrix[key]);

    if (!matrixOpts.output)
      matrixOpts.output = path.join(dirname, basename.replace(/\.\w+$/, function (ext) {
        return '.' + key + ext;
      }));
    var args = optionsToArgs(matrixOpts);
    args.unshift(file);
    console.log('\r\nuglifyjs ' + args.join(' '));
    cp.execFileSync(uglify, args, {stdio: 'inherit'});
  });
}

function snakeCase(key) {
  return key.replace(/[A-Z]/g, function (w) { return '_' + w.toLowerCase(); });
}
function kebabCase(key) {
  return key.replace(/[A-Z]/g, function (w) { return '-' + w.toLowerCase(); });
}

function innerOptionsMap(obj, parentKey) {
  return function (key) {
    var val = obj[key];
    return (parentKey === 'define' || parentKey === 'd' ? key : snakeCase(key)) + '=' + val;
  };
}

function optionsToArgs(opts) {
  var args = [];
  Object.keys(opts).forEach(function (key) {
    var value = opts[key];
    var argKey = kebabCase(key);
    argKey = (argKey.length === 1 ? '-' : '--') + argKey;
    if (value === true) {
      args.push(argKey);
    } else if (typeof value === 'object') {
      args.push(argKey, Object.keys(value).map(innerOptionsMap(value, key)).join(','))
    } else {
      args.push(argKey, value);
    }
  });
  return args;
}
