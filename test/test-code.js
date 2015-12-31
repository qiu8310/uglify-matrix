var fs = require('fs');
var path = require('path');


var matrixCode = require('../src/index').matrixCode;
var content = fs.readFileSync(path.join(__dirname, 'fixtures', 'sample.js')).toString();


matrixCode(content, {
  debug: {
    define: {
      __DEBUG__: true,
      __PROD__: false,
      __DEV__: true
    }
  }
});
