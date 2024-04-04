import { Sequelize } from 'sequelize';

import config from '../config.js';
import initDbMethods from './methods.js';
import initDbModels from './models.js';
import logger from '../logger.js';

export default async function initDataBase() {
  try {
    const sequelize = new Sequelize({
      ...config.db,
      logging: process.env.DB_LOGGING ? msg => logger.log(msg) : false,
    });

    const models = await initDbModels(sequelize);

    if (process.env.DB_SYNC) {
      await sequelize.sync({ alter: true });
    }

    const { lessons } = initDbMethods({ sequelize, models });

    return {
      dbMethods: {
        lessons,
      },
      dbDisconnect: () => {
        return sequelize.close();
      },
    };
  } catch (err) {
    logger.error('sequelize_failed', err);
  }
}
