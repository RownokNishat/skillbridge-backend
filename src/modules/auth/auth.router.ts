import express from 'express';
import { AuthController } from './auth.controller';
import auth from '../../middlewares/auth';

const router: express.Router = express.Router();

// Validate session token and return user data
router.get('/get-session', auth(), AuthController.getSession);

export const AuthRouter = router;
