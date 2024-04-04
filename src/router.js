import validator from './validator.js';

export default async function initRouter({ server, controller }) {
  const { searchLessons } = controller;

  const { validate, schema } = validator;

  server.get('/lessons', validate(schema.searchLessons), searchLessons);

  server.all('*', (req, res) => {
    res.status(404).send('page_not_found');
  });
}
