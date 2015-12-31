var path = require('path');
var cp = require('child_process');

var assign = require('lodash.assign');
var pkg = require('uglify-js/package.json');
var uglify = require.resolve('uglify-js/' + pkg.bin.uglifyjs);

function _matrix(matrix, options, file, cb) {
  var dirname = path.dirname(file);
  var basename = path.basename(file);

  matrix = matrix || {};
  options = assign({
    mangle: true,
    compress: {warnings: false}
  }, options);


  if (!Object.keys(matrix).length) {
    matrix.min = {
      compress: {
        deadCode: true,
        unused: true,
        warnings: false,
        dropConsole: true
      }
    };
  }

  Object.keys(matrix).forEach(function (key) {
    var matrixOpts = assign({}, options, matrix[key]);
    var args = optionsToArgs(matrixOpts);

    if (file) {
      if (args.indexOf('-o') < 0 || args.indexOf('--output') < 0) {
        args.push('--output', path.join(dirname, basename.replace(/\.\w+$/, function (ext) {
          return '.' + key + ext;
        })));
      }
    }

    console.log('\r\nuglifyjs ' + args.join(' '));
    cb(args);
  });
}

function matrixFile(file, matrix, options) {
  _matrix(matrix, options, file, function (args) {

    args.unshift(uglify, file);
    cp.spawnSync('node', args, {stdio: 'inherit'});

  });
}

function matrixCode(code, matrix, options) {
  var file = options && options.file;
  if (file) delete options.file;

  _matrix(matrix, options, file, function (args) {

    args.unshift(uglify);
    args.push('-');
    var child = cp.spawn('node', args, {stdio: ['pipe', 1, 2]});
    child.stdin.write(code);
    child.stdin.end();
  });
}


module.exports = matrixFile;
module.exports.matrixFile = matrixFile;
module.exports.matrixCode = matrixCode;


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
    if (typeof value === 'boolean' || value == null) {
      if (value) args.push(argKey);
    } else if (typeof value === 'object') {
      args.push(argKey, Object.keys(value).map(innerOptionsMap(value, key)).join(','))
    } else {
      args.push(argKey, value);
    }
  });
  return args;
}
