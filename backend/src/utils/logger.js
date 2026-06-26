'use strict';
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) =>
      `${timestamp} [livishield-backend] ${level}: ${message}`
    )
  ),
  transports: [
    new transports.Console(),
  ],
});

module.exports = logger;
