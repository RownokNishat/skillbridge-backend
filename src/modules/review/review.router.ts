import express from 'express';
import { ReviewController } from './review.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = express.Router();

router.post('/', auth(UserRole.STUDENT), ReviewController.createReview);

export const ReviewRouter = router;
