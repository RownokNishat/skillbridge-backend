import express from 'express';
import { TutorController } from './tutor.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = express.Router();

router.get('/tutors', TutorController.getAllTutors); // Public
router.get('/tutors/:id', TutorController.getTutorById); // Public
router.put('/tutor/profile', auth(UserRole.TUTOR), TutorController.updateProfile);

export const TutorRouter = router;
