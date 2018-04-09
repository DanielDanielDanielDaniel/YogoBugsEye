
var path = require('path');
var util = require('util');
var async = require('async');
var express = require('express');
var config = require('./config');
var log = require('./utils/log').getLogger('log');
var accesslog = require('./utils/log').getLogger('accesslog');
var crons = require('./collector/crons');
var app = express();

accesslog.debug('start');

app.configure(function() {
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.methodOverride());
	app.use(app.router);
	return app.use(function(err, req, res, next) {
	  if (err) {
	    log.error(err);
	    res.send(err.toString(), 500);
	  }
	  return next(err);
	});
});


initPort = (parseInt(process.argv[2])) || config.defaultPort;


app.listen(initPort);
log.error("[" + process.pid + "]logmonitor listening on port " + initPort + " in " + app.settings.env + " mode");


crons.start(config);

process.on('uncaughtException', function(err) {
	var _ref;
	return log.error("uncaughtException: " + ((_ref = err.stack) != null ? _ref : util.inspect(err)));
});