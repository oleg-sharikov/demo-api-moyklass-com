const { env } = process;

export default {
  serviceName: 'api',
  servicePort: parseInt(env.API_SERVICE_PORT, 10) || 4444,
  logLevel: env.LOG_LEVEL,
  db: {
    dialect: env.DB_DIALECT || 'postgres',
    host: env.DB_HOST || 'localhost',
    port: env.DB_PORT || '5432',
    username: env.DB_USER || 'postgres',
    password: env.DB_PASS || 'postgres',
    database: env.DB_NAME || 'moyklass',
  },
  api: {
    lessonsPerPage: parseInt(env.API_DEFAULT_LESSONS_PER_PAGE, 10) || 5,
    maxLessonsPerPage: parseInt(env.API_MAX_LESSONS_PER_PAGE, 10) || 100,
  },
};
