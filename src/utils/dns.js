if (process.env['NODE_ENV'] === 'production') {
    exports.resolve4 = (require('dns')).resolve4;
  } else {
    exports.resolve4 = function(host, cb) {
      return cb(null, ['192.168.1.219']);
    };
  }