const { createLogger, format, transports } = require("winston");
const { combine } = format;
const util = require('util');
const moment = require('moment');
const MESSAGE = Symbol.for('message');

const logger = createLogger({
  level: "info",
  format: combine(
    format(function(info, opts) {
        prefix = util.format('[%s] [%s]', moment().format('YYYY-MM-DD hh:mm:ss').trim(), info.level.toUpperCase());
        if (info.splat) {
            info.message = util.format('%s %s', prefix, util.format(info.message, ...info.splat));
        } else {
            info.message = util.format('%s %s', prefix, info.message);
        }
        return info;
    })(),
    format(function(info) {
        info[MESSAGE] = info.message + ' ' + JSON.stringify(
            Object.assign({}, info, {
                level: undefined,
                message: undefined,
                splat: undefined
            })
        );
        return info;
    })()
),
  transports: [
    new transports.File({ 
        filename: "quick-start-error.log", 
        level: "error",
    }),
    new transports.File({ filename: "quick-start-combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: combine(format.colorize(), format.simple()),
    })
  );
}

module.exports = logger;
