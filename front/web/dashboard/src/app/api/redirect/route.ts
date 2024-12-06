import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

import { SESSION_COOKIE_NAME } from '@/constants';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const token = searchParams.get(SESSION_COOKIE_NAME);

  cookies().set(SESSION_COOKIE_NAME, token!, { expires: new Date(Date.now() + 259200 * 1000) }); // 3 Days

  redirect('/dashboard');
}
