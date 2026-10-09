import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getUsers, getUserById } from '../controllers/userController';

const router = Router();
router.use(authenticate);
router.get('/',    getUsers);
router.get('/:id', getUserById);
export default router;
