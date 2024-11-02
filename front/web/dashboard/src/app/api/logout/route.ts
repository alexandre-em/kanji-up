import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SESSION_COOKIE_NAME } from '@/constants';

export async function GET() {
  cookies().delete(SESSION_COOKIE_NAME);

  redirect('/');
}
