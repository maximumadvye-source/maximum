// مصادقة لوحة الإدارة: كلمة سر واحدة من .env.local (ADMIN_PASSWORD) + كوكي موقّع بـ HMAC.
import { createHmac, timingSafeEqual } from 'crypto';

export const COOKIE = 'adm_session';
export const MAX_AGE = 60 * 60 * 24 * 7; // 7 أيام

const secret = () => process.env.ADMIN_PASSWORD || '';

/** اللوحة معطّلة ما لم تُضبط كلمة سر لا تقل عن 6 أحرف */
export const adminEnabled = () => secret().length >= 6;

const sign = (value: string) =>
  createHmac('sha256', secret()).update(`adamomer-admin:${value}`).digest('hex');

export function makeToken(): string {
  const exp = String(Date.now() + MAX_AGE * 1000);
  return `${exp}.${sign(exp)}`;
}

export function verifyToken(token?: string | null): boolean {
  if (!token || !adminEnabled()) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(exp));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function checkPassword(input: string): boolean {
  if (!adminEnabled()) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(secret());
  return a.length === b.length && timingSafeEqual(a, b);
}
