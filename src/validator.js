import { validationResult, query } from 'express-validator';

import config from './config.js';

const validate = validations => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).send(errors.array());
  };
};

const makeRangeFromString = value => value.split(',');

const schema = {
  searchLessons: [
    query('date')
      .customSanitizer(makeRangeFromString)
      .isArray({ min: 1, max: 2 })
      .withMessage('Date range must have 2 elements')
      .isISO8601()
      .withMessage('Date format is YYYY-MM-DD')
      .custom((value, { req }) => {
        const [rangeFrom, rangeTo] = req.query.date;
        if (rangeFrom && rangeTo) {
          return rangeFrom < rangeTo;
        }
        return true;
      })
      .withMessage('Range `from` must be less than range `to`')
      .optional(),

    query('status').isInt({ min: 0, max: 1 }).optional(),

    query('teacherIds').customSanitizer(makeRangeFromString).isInt().optional(),

    query('studentsCount')
      .customSanitizer(makeRangeFromString)
      .isArray({ min: 1, max: 2 })
      .withMessage('Student count range must have 2 elements')
      .isInt()
      .custom((value, { req }) => {
        const [rangeFrom, rangeTo] = req.query.studentsCount;
        if (rangeFrom && rangeTo) {
          return rangeFrom < rangeTo;
        }
        return true;
      })
      .withMessage('Range `from` must be less than range `to`')
      .optional(),

    query('page').isInt({ min: 1 }).optional(),

    query('lessonsPerPage').isInt({ min: 1, max: config.api.maxLessonsPerPage }).optional(),
  ],
};

export default {
  validate,
  schema,
};
