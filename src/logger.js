import config from './config.js';

const { serviceName } = config;

const logger = (args, mode) => console[mode](new Date().toISOString(), serviceName, ...args);

export default {
  log: (...args) => logger(args, 'log'),
  error: (...args) => logger(args, 'error'),
  debug: (...args) => logger(args, 'debug'),
};
