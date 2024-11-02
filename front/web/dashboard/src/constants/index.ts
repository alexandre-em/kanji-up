export const SESSION_COOKIE_NAME = 'access_token';
export const FETCH_CACHE_REVALIDATION_LONG = 86400; // 1 day
export const FETCH_CACHE_REVALIDATION_SHORT = 600; // 10 mins
export const protectedRoutes = [/\/kanji(.+)?/g, /\/word(.+)?/g, /\/user(.+)?/g, /\/app/g, /\/dashboard/g];

export * from './env';
