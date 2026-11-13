import express from 'express';
import { resolve } from 'node:path';
import usersRouter from './routes/users.mjs';
import articlesRouter from './routes/articles.mjs';

const app = express();
const PORT = 3000;

// Middleware для JSON
app.use(express.json());

// Кореневий маршрут
app.get('/', (req, res) => {
  res.status(200).send('Get root route');
});

// API маршрути
app.use('/users', usersRouter);
app.use('/articles', articlesRouter);

// Interactive API playground (served locally at /demo/)
app.use('/demo', express.static(resolve(process.cwd(), 'demo')));

// Обробка неіснуючих маршрутів
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Глобальна обробка помилок
app.use((err, req, res, next) => {
  if (err.status === 400 && err.type === 'entity.parse.failed') {
    return res.status(400).send('Bad Request');
  }

  console.error(err);
  return res.status(500).send('Internal Server Error');
});

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export { app, server };
