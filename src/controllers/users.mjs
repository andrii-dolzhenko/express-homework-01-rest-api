import { users } from '../data/users.mjs';

let userCounter = 0;

// Отримати всіх користувачів
export function getUsers(req, res) {
  return res.status(200).json([...users.values()]);
}

// Отримати користувача за ID
export function getUserById(req, res) {
  const user = users.get(req.params.userId);

  if (!user) {
    return res.status(404).send('Not Found');
  }

  return res.status(200).json(user);
}

// Створити користувача
export function createUser(req, res, next) {
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
}

// Оновити користувача
export function updateUser(req, res) {
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
}

// Видалити користувача
export function deleteUser(req, res) {
  const { userId } = req.params;

  if (!users.has(userId)) {
    return res.status(404).send('Not Found');
  }

  users.delete(userId);
  return res.status(204).end();
}
