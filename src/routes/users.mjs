import { Router } from 'express';
import { users } from '../data/users.mjs';

const router = Router();
let userCounter = 0;

// Отримати всіх користувачів
router.get('/', (req, res) => {
  res.status(200).json([...users.values()]);
});

// Отримати користувача за ID
router.get('/:userId', (req, res) => {
  const user = users.get(req.params.userId);

  if (!user) {
    return res.status(404).send('Not Found');
  }

  res.status(200).json(user);
});

// Створити користувача
router.post('/', (req, res, next) => {
  const { name } = req.body ?? {};

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).send('Bad Request');
  }

  try {
    const id = `user-${Date.now()}-${++userCounter}`;
    const user = { id, name: name.trim() };

    users.set(id, user);

    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// Оновити користувача
router.put('/:userId', (req, res) => {
  const { userId } = req.params;
  const user = users.get(userId);

  if (!user) {
    return res.status(404).send('Not Found');
  }

  const { name } = req.body ?? {};

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).send('Bad Request');
  }

  const updatedUser = { id: userId, name: name.trim() };
  users.set(userId, updatedUser);

  return res.status(200).json(updatedUser);
});

// Видалити користувача
router.delete('/:userId', (req, res) => {
  const { userId } = req.params;

  if (!users.has(userId)) {
    return res.status(404).send('Not Found');
  }

  users.delete(userId);
  return res.status(204).end();
});

export default router;
