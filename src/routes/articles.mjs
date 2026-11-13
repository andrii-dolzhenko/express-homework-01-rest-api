import { Router } from 'express';
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/articles.mjs';

const router = Router();

router.get('/', getArticles);
router.get('/:articleId', getArticleById);
router.post('/', createArticle);
router.put('/:articleId', updateArticle);
router.delete('/:articleId', deleteArticle);

export default router;
