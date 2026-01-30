import express from 'express';
import { UserController } from './user.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = express.Router();

router.get('/admin/users', auth(UserRole.ADMIN), UserController.getAllUsers);

export const UserRouter = router;
