var healthCheck, lastCheckState, restartReq, updateProcessInfo, _bigMemState, _downState, _getCheckList, _getHealthInfo, _normalState;

var util = require('util');
var fs = require('fs');
var async = require('async');
var request = require('request');
var ProcessInfo = {};
var lastCheckState = {};
var exec = require('child_process').exec;

module.exports = {
  run: function(config, cb) {
    return healthCheck(function(err, health) {
      if (health.length > 0) {
        return async.eachSeries(health, function(item, cb) {
          var content, ls, subject;
          ls = lastCheckState[item.id];
          lastCheckState[item.id] = item;
          if (ls && (ls.state === item.state) && (!item.curMem || (item.curMem <= ls.curMem))) {
            return cb(null);
          } else if (!ls && item.state === "ok") {
            return cb(null);
          } else {
            subject = "" + item.comment + ":" + item.state + " ";
            content = "" + item.comment + " " + item.state + ": " + item.error + " \n " + item.url + " method " + item.method + " \n";
            // return checker.sendMail(subject, content, true, cb);
            console.log("sendMail1 "+subject+content);
          }
        }, cb);
      } else {
        if (cb) {
          return cb(err);
        }
      }
    });
  },
  info: function(cb) {
    return healthCheck(cb);
  }
};

healthCheck = function(callback) {
  var all, health;
  health = [];
  all = [];
  return async.auto({
    'checkList': function(cb) {
      return _getCheckList(cb);
    },
    'initProcessInfo': [
      'checkList', function(cb, _arg) {
        var checkList;
        checkList = _arg.checkList;
        if (checkList != null) {
          checkList.forEach(function(_arg1) {
            var autoRestart, dir, execCommand, id;
            id = _arg1.id, autoRestart = _arg1.autoRestart, execCommand = _arg1.execCommand, dir = _arg1.dir;
            if (!ProcessInfo[id] && autoRestart) {
              return ProcessInfo[id] = {
                autoRestart: autoRestart,
                execCommand: execCommand,
                dir: dir
              };
            }
          });
        }
        return cb(null);
      }
    ],
    'check': [
      'checkList', 'initProcessInfo', function(cb, _arg) {
        var checkList;
        checkList = _arg.checkList;
        if (!checkList) {
          return cb(null);
        }
        return async.forEach(checkList, function(checkItem, callback) {
          var id, method, url;
          id = checkItem.id, url = checkItem.url, method = checkItem.method;
          return _getHealthInfo(url, method, function(err, res, body) {
            var rss;
            if (body) {
              rss = body.rss;
            }
            if ((res != null ? res.statusCode : void 0) !== 200) {
              health.push(checkItem);
              return _downState(checkItem, callback);
            } else {
              updateProcessInfo(id, body);
              if (rss > 800 * 1024 * 1024) {
                health.push(checkItem);
                return _bigMemState(checkItem, rss, callback);
              } else {
                health.push(checkItem);
                return _normalState(checkItem, callback);
              }
            }
          });
        }, cb);
      }
    ]
  }, function(err) {
    return callback(err, health);
  });
};

_getCheckList = function(callback) {
  return fs.readFile("" + __dirname + "/../health_checker_config.json", function(err, data) {
    return callback(err, JSON.parse(data));
  });
};

_getHealthInfo = function(url, method, callback) {
  var doRequest, times;
  times = 0;
  doRequest = function() {
    var options;
    times++;
    options = {
      url: url,
      method: method,
      json: true
    };
    return request(options, function(err, res, body) {
      if ((err || (res != null ? res.statusCode : void 0) !== 200) && times < 3) {
        return setTimeout(doRequest, 3000);
      } else {
        return callback(err, res, body);
      }
    });
  };
  return doRequest();
};

_downState = function(checkItem, callback) {
  checkItem.state = "down";
  checkItem.error = "statusCode: " + (typeof res !== "undefined" && res !== null ? res.statusCode : void 0);
  if (!ProcessInfo[checkItem.id]) {
    return callback("can't get restart info " + checkItem.url);
  }
  if (!ProcessInfo[checkItem.id].autoRestart) {
    return callback(null);
  }
  return restartReq(checkItem.url, checkItem.id, function(err) {
    if (err) {
      checkItem.error += err;
    }
    checkItem.error = " tried restart";
    return callback(null);
  });
};

_normalState = function(checkItem, callback) {
  checkItem.state = "ok";
  return callback(null);
};

_bigMemState = function(checkItem, rss, callback) {
  var memoryUsage;
  memoryUsage = Math.round(rss / (1024 * 1024));
  checkItem.state = "memory>" + (Math.floor(memoryUsage / 100) * 100) + "MB";
  checkItem.curMem = Math.floor(memoryUsage / 100) * 100;
  checkItem.error = "memory useage: " + memoryUsage + "MB";
  if (memoryUsage < 800) {
    return callback(null);
  }
  if (!ProcessInfo[checkItem.id]) {
    return callback("can't get restart info " + checkItem.url);
  }
  if (!ProcessInfo[checkItem.id].autoRestart) {
    return callback(null);
  }
  return restartReq(checkItem.url, checkItem.id, function(err) {
    if (err) {
      checkItem.error += err;
    }
    checkItem.error = " tried restart";
    return callback(null);
  });
};

restartReq = function(url, id, callback) {
  console.log(" tried restart api-server");
  var cmdStr = "NODE_ENV=development PORT=80 nohup node ../../../Draw77ServerPro/app.js >../../../Draw77ServerPro/nohup.log &"
  exec(cmdStr, function(err,stdout,stderr){
        if(err) {
            console.log('restart error:'+stderr);
        } else {
            console.log(" restart sucess");
            return callback();
        }
    });
};

updateProcessInfo = function(id, body) {
  if ((body != null ? body.autoRestart : void 0) === true) {
    return ProcessInfo[id] = body;
  }
};