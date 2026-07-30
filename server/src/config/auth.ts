export const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';
export const AUTH_COOKIE_NAME = 'hrm_token';
export const JWT_EXPIRES_IN = '7d' as const;
