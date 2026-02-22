import express from 'express';
import { RegistrationController } from './registration.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router: express.Router = express.Router();

// Public registration endpoint
router.post('/register', RegistrationController.register);

// Protected routes (for authenticated users)
router.post('/register/setup-profile', auth(UserRole.TUTOR), RegistrationController.setupTutorProfile);
router.get('/register/status', auth(), RegistrationController.checkStatus);

export const RegistrationRouter = router;
