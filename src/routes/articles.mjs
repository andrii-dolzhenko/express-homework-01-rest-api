import { Router } from 'express';
import { articles } from '../data/articles.mjs';

const router = Router();
let articleCounter = 0;

// Отримати всі статті
router.get('/', (req, res) => {
  res.status(200).json([...articles.values()]);
});

// Отримати статтю за ID
router.get('/:articleId', (req, res) => {
  const article = articles.get(req.params.articleId);

  if (!article) {
    return res.status(404).send('Not Found');
  }

  return res.status(200).json(article);
});

// Створити статтю
router.post('/', (req, res, next) => {
  const { title } = req.body ?? {};

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).send('Bad Request');
  }

  try {
    const id = `article-${Date.now()}-${++articleCounter}`;
    const article = { id, title: title.trim() };

    articles.set(id, article);

    return res.status(201).json(article);
  } catch (error) {
    next(error);
  }
});

// Оновити статтю
router.put('/:articleId', (req, res) => {
  const { articleId } = req.params;

  if (!articles.has(articleId)) {
    return res.status(404).send('Not Found');
  }

  const { title } = req.body ?? {};

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).send('Bad Request');
  }

  const updatedArticle = { id: articleId, title: title.trim() };
  articles.set(articleId, updatedArticle);

  return res.status(200).json(updatedArticle);
});

// Видалити статтю
router.delete('/:articleId', (req, res) => {
  const { articleId } = req.params;

  if (!articles.has(articleId)) {
    return res.status(404).send('Not Found');
  }

  articles.delete(articleId);

  return res.status(204).end();
});

export default router;
