import express from 'express';
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

// Обробка неіснуючих маршрутів
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Глобальна обробка помилок
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Internal Server Error');
});

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export { app, server };
