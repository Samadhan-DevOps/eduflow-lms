import { Router } from 'express';
import { body } from 'express-validator';
import { authLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import {
  register, registerValidators,
  login,    loginValidators,
  getMe, updateProfile, changePassword,
} from '../controllers/authController';

const router = Router();

router.post('/register', authLimiter, registerValidators, validate, register);
router.post('/login',    authLimiter, loginValidators,    validate, login);

router.use(authenticate);
router.get('/me', getMe);
router.put('/me', [
  body('first_name').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('last_name').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
], validate, updateProfile);
router.put('/me/password', [
  body('current_password').notEmpty().withMessage('Current password required'),
  body('new_password')
    .isLength({ min: 8 }).withMessage('New password must be 8+ chars')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password needs uppercase, lowercase, and a number'),
], validate, changePassword);

export default router;
