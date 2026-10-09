import { Request, Response } from 'express';
import { query, queryOne } from '../config/database';
import { ApiResponse } from '../models/types';

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  const data = await query(
    `SELECT id, email, first_name, last_name, role, avatar_url, is_active, created_at
     FROM users WHERE is_active = true ORDER BY first_name, last_name`
  );
  res.json({ success: true, data } as ApiResponse);
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const data = await queryOne(
    `SELECT id, email, first_name, last_name, role, avatar_url, created_at
     FROM users WHERE id = $1 AND is_active = true`,
    [req.params['id']]
  );
  if (!data) { res.status(404).json({ success: false, message: 'User not found' } as ApiResponse); return; }
  res.json({ success: true, data } as ApiResponse);
};
