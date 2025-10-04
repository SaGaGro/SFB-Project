import express from 'express';
import {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview
} from '../controllers/review.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/', getAllReviews);

// Protected routes
router.post('/', authenticate, createReview);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

export default router;