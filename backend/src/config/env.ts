import dotenv from 'dotenv';
dotenv.config();

function str(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback;
  if (val === undefined) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function num(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) throw new Error(`Env var ${key} must be a number`);
  return parsed;
}

export const env = {
  NODE_ENV:      str('NODE_ENV', 'development'),
  PORT:          num('PORT', 5000),
  DATABASE_URL:  process.env['DATABASE_URL'] || '',
  DB_HOST:       str('DB_HOST', 'localhost'),
  DB_PORT:       num('DB_PORT', 5432),
  DB_NAME:       str('DB_NAME', 'eduflow'),
  DB_USER:       str('DB_USER', 'postgres'),
  DB_PASSWORD:   str('DB_PASSWORD', 'postgres'),
  JWT_SECRET:    str('JWT_SECRET', 'dev-secret-change-in-production-min32'),
  JWT_EXPIRES_IN: str('JWT_EXPIRES_IN', '7d'),
  CORS_ORIGINS:  str('CORS_ORIGINS', 'http://localhost:3000').split(',').map(s => s.trim()),
  LOG_LEVEL:     str('LOG_LEVEL', 'info'),
  BCRYPT_ROUNDS: num('BCRYPT_ROUNDS', 12),
} as const;
