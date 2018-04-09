var path = require('path');

module.exports = {
  dir: __dirname,
  "public": path.join(__dirname + '../../../web/public'),
  jade: path.join(__dirname + '../../../web/jade'),
  defaultPort: 2148,
  connection: {
    production: {
      user: "root",
      password: 'Cyd1404008',
      host: '47.106.84.15',
      database: 'yogofunDB',
      port: 3306,
      pool: 250,
      idleTimeoutMillis: 30000,
      timeout: 5000
    },
    development: {
      user: "root",
      password: 'Cyd1404008',
      host: '47.106.84.15',
      database: 'yogofunDB',
      port: 3306,
      pool: 250,
      idleTimeoutMillis: 30000,
      timeout: 5000
    },
    test: {
      user: "root",
      password: 'Cyd1404008',
      host: '47.106.84.15',
      database: 'yogofunDB',
      port: 3306,
      pool: 250,
      idleTimeoutMillis: 30000,
      timeout: 5000
    }
  },
  mail: {
    user: "1184691072@qq.com",
    password: "821109sy16wd/",
    host: "mail.qq.com",
    ssl: true,
    smtpPort: 465,
    defaultTo: "390388109@qq.com",
    defaultText: "yogomonitor",
    defaultHtml: "yogomonitor"
  },
  buddhaEyeMail: {
    user: "1184691072@qq.com",
    password: "821109sy16wd/",
    host: "mail.qq.com",
    ssl: true,
    smtpPort: 465,
    defaultTo: "390388109@qq.com",
    defaultText: "yogomonitor",
    defaultHtml: "yogomonitor"
  },
  crons: {
    // "mongodb_checker": "0 * * * * *",
    "health_checker": "0 * * * * * "
  },
  jobs: {
    mongodb_checker: {
      conf: ["127.0.0.1:28017"]
    },
  }
};