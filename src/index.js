import express from 'express';

import logger from './logger.js';
import config from './config.js';
import initDataBase from './db/index.js';
import initController from './controller.js';
import initRouter from './router.js';

const server = express();

async function init() {
  try {
    server.use(express.json());

    const { dbMethods, dbDisconnect } = await initDataBase();

    const controller = await initController(dbMethods);

    await initRouter({ server, controller });

    server.listen(config.servicePort, () => {
      logger.log(`listening on port ${config.servicePort}`);
    });

    async function exit() {
      logger.log('Terminating DB connection...');
      await dbDisconnect();
      process.exit(0);
    }
    process.on('SIGINT', exit).on('SIGTERM', exit);
  } catch (err) {
    logger.error(err.message || err);
    process.exit(1);
  }
}

init();
