import express from 'express';

const app = express();
const PORT = 3000;

// Middleware для обробки JSON
app.use(express.json());

// Кореневий маршрут
app.get('/', (req, res) => {
  res.status(200).send('Get root route');
});

// Запуск сервера
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export { app, server };
