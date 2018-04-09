var util = require('util');

var  CronJob = require('cron').CronJob;

var  log = require('../utils/log').getLogger('crons');

var  startRightNow = true;

var  timeZone = null;

var  onStop = null;

exports.start = function(config) {
    var name, time, _ref, _results;
    _ref = config.crons;
    _results = [];
    for (name in _ref) {
      time = _ref[name];
      _results.push((function(name, time) {
        var task;
        task = function() {
          var err, m, startTime, _ref1;
          try {
            m = require("./" + name);
          } catch (_error) {
            err = _error;
            log.error("can not load module " + name + ": " + ((_ref1 = err.stack) != null ? _ref1 : util.inspect(err)));
            return;
          }
          if (typeof (m != null ? m.run : void 0) !== 'function') {
            return;
          }
          startTime = new Date();
          log.debug("cron start: " + name);
          return m.run(config.jobs[name], function(err) {
            var elapsed, endTime;
            if (err) {
              log.error(err);
            }
            endTime = new Date();
            elapsed = endTime.getTime() - startTime.getTime();
            if (elapsed < 3000) {
              return log.info("cron done: " + name + ",elapsed " + elapsed + " ms");
            } else {
              return log.warn("cron done: " + name + ",elapsed " + elapsed + " ms");
            }
          });
        };
        return new CronJob(time, task, onStop, startRightNow, timeZone);
      })(name, time));
    }
    return _results;
  };