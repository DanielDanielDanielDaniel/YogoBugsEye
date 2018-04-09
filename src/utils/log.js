
var fs, logs, path, util, winston, _exists, _getFileSplit, _mkdir;

  winston = require('winston');
  path = require('path');
  fs = require('fs');
  util = require('util');
  _exists = function(folder) {
    if (fs.existsSync) {
      return fs.existsSync(folder);
    } else {
      return path.existsSync(folder);
    }
  };

  _getFileSplit = function() {
    var split;
    if (process.platform === 'win32') {
      split = '\\';
    } else if (process.platform === 'linux') {
      split = '/';
    }
    return split;
  };

  _mkdir = function(folder) {
    var names, parentFolder;
    names = folder.split(_getFileSplit());
    names.pop();
    parentFolder = names.join(_getFileSplit());
    if (_exists(folder)) {
      return;
    }
    if (names.length === 1 || _exists(parentFolder)) {
      return fs.mkdirSync(folder);
    } else {
      _mkdir(parentFolder);
      return fs.mkdirSync(folder);
    }
  };

  logs = {};

  module.exports = {
    getLogger: function(name) {
      var filename, folder, logger;
      if (name == null) {
        name = 'master';
      }
      if (logs[name]) {
        return logs[name];
      }
      if (__dirname.indexOf('release') > 0) {
        filename = path.resolve("/data/logs/release" + __dirname.split('release')[1].replace(/\./g, '').replace(/\d/g, '') + ("/../" + name + ".log"));
      } else {
        filename = path.resolve(__dirname, "../logs/" + name + ".log");
      }
      folder = path.dirname(filename);

      if (!_exists(folder)) {
        _mkdir(folder);
      }
      logger = new winston.Logger({
        transports: [
          new winston.transports.Console(), new winston.transports.File({
            filename: filename,
            level: 'error',
            json: false
          })
        ]
      });
      logger.logError = function(err) {
        var _ref;
        if (err) {
          return logger.error((_ref = err.stack) != null ? _ref : util.inspect(err), {
            currentStack: new Error("").stack
          });
        }
      };
      logs[name] = logger;
      return logger;
    }
  };