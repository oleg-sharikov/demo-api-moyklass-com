import config from './config.js';
import logger from './logger.js';
import { LOG_LEVEL_DEBUG } from './constants.js';

function send(errorName, err, res, statusCode) {
  logger.error(`${errorName}:`, err?.message || err);

  if (config.logLevel === LOG_LEVEL_DEBUG) {
    logger.debug(err.stack);
  }

  res.status(statusCode || 500).send(errorName);
}

export default {
  send,
};
