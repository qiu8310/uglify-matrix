function sample () {
  var debug = 0;
  var prod = 1;
  var dev = 2;

  if (__DEBUG__) {
    debug = true;
    console.log('debug: ' + debug);
  }

  if (__PROD__) {
    prod = true;
    console.log('prod: ' + prod);
  }

  if (__DEV__) {
    dev = true;
    console.log('dev: ' + dev);
  }
}



