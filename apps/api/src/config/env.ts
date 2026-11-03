import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const projectRoot = path.resolve(apiRoot, '../..');

// Load environment variables (.env.local overrides .env; api overrides project root)
dotenv.config({ path: path.join(projectRoot, '.env') });
dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true });
dotenv.config({ path: path.join(apiRoot, '.env'), override: true });
dotenv.config({ path: path.join(apiRoot, '.env.local'), override: true });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const defaultCorsOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? process.env.API_PORT ?? 4000),
  databaseUrl: requireEnv('DATABASE_URL'),
  databaseUrlUnpooled: process.env.DATABASE_URL_UNPOOLED,
  jwtSecret: requireEnv('JWT_SECRET'),
  corsOrigins: (process.env.CORS_ORIGIN ?? defaultCorsOrigins.join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  adminEmail: process.env.ADMIN_EMAIL ?? 'admin@porchlight.com',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'ChangeMe123!',
  adminName: process.env.ADMIN_NAME ?? 'Porchlight Admin',
};
