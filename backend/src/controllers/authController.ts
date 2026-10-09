import { Request, Response } from 'express';
import { body } from 'express-validator';
import { authService } from '../services/authService';
import { ApiResponse } from '../models/types';

export const registerValidators = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password needs uppercase, lowercase, and a number'),
  body('first_name').trim().notEmpty().withMessage('First name required'),
  body('last_name').trim().notEmpty().withMessage('Last name required'),
];

export const loginValidators = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

export const register = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, message: 'Account created successfully', data: result } as ApiResponse);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.login(req.body);
  res.json({ success: true, message: 'Welcome back!', data: result } as ApiResponse);
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = await authService.getMe(req.user!.userId);
  res.json({ success: true, data: user } as ApiResponse);
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await authService.updateProfile(req.user!.userId, req.body);
  res.json({ success: true, message: 'Profile updated', data: user } as ApiResponse);
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const { current_password, new_password } = req.body;
  await authService.changePassword(req.user!.userId, current_password, new_password);
  res.json({ success: true, message: 'Password changed successfully' } as ApiResponse);
};
