import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, queryOne } from '../config/database';
import { env } from '../config/env';
import { User, AuthPayload } from '../models/types';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

type SafeUser = Omit<User, never>;

export interface AuthResult {
  user: SafeUser;
  token: string;
}

class AuthService {
  private sign(payload: AuthPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as string,
    } as jwt.SignOptions);
  }

  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<AuthResult> {
    const { email, password, first_name, last_name } = data;

    const exists = await queryOne('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists) throw new AppError('An account with this email already exists.', 409);

    const hash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

    const user = await queryOne<User>(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, first_name, last_name, role, avatar_url, is_active, created_at, updated_at`,
      [email.toLowerCase(), hash, first_name, last_name]
    );
    if (!user) throw new AppError('Failed to create account.', 500);

    await query(
      `INSERT INTO project_members (project_id, user_id, role)
       SELECT id, $1, 'member' FROM projects WHERE FALSE`, // noop — just keeping for future use
      [user.id]
    ).catch(() => {/* non-critical */});

    logger.info('User registered', { userId: user.id });
    return { user, token: this.sign({ userId: user.id, email: user.email, role: user.role }) };
  }

  async login(data: { email: string; password: string }): Promise<AuthResult> {
    const row = await queryOne<User & { password_hash: string }>(
      `SELECT id, email, first_name, last_name, role, avatar_url, is_active, password_hash, created_at, updated_at
       FROM users WHERE email = $1`,
      [data.email.toLowerCase()]
    );

    if (!row || !row.is_active) throw new AppError('Invalid email or password.', 401);

    const valid = await bcrypt.compare(data.password, row.password_hash);
    if (!valid) throw new AppError('Invalid email or password.', 401);

    const { password_hash: _ph, ...user } = row;
    logger.info('User logged in', { userId: user.id });
    return { user, token: this.sign({ userId: user.id, email: user.email, role: user.role }) };
  }

  async getMe(userId: string): Promise<User> {
    const user = await queryOne<User>(
      `SELECT id, email, first_name, last_name, role, avatar_url, is_active, created_at, updated_at
       FROM users WHERE id = $1 AND is_active = true`,
      [userId]
    );
    if (!user) throw new AppError('User not found.', 404);
    return user;
  }

  async updateProfile(userId: string, data: Partial<Pick<User, 'first_name' | 'last_name' | 'avatar_url'>>): Promise<User> {
    const user = await queryOne<User>(
      `UPDATE users SET
         first_name = COALESCE($1, first_name),
         last_name  = COALESCE($2, last_name),
         avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4
       RETURNING id, email, first_name, last_name, role, avatar_url, is_active, created_at, updated_at`,
      [data.first_name ?? null, data.last_name ?? null, data.avatar_url ?? null, userId]
    );
    if (!user) throw new AppError('User not found.', 404);
    return user;
  }

  async changePassword(userId: string, currentPwd: string, newPwd: string): Promise<void> {
    const row = await queryOne<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );
    if (!row) throw new AppError('User not found.', 404);
    const valid = await bcrypt.compare(currentPwd, row.password_hash);
    if (!valid) throw new AppError('Current password is incorrect.', 400);
    const hash = await bcrypt.hash(newPwd, env.BCRYPT_ROUNDS);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);
    logger.info('Password changed', { userId });
  }
}

export const authService = new AuthService();
