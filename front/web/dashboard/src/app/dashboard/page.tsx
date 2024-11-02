import React from 'react';

import UserList from '@/components/UserList';
import { FETCH_CACHE_REVALIDATION_LONG, SESSION_COOKIE_NAME, authUrl } from '@/constants';
import getCookies from '@/constants/cookies';
import getUser from '@/constants/user';

import HighlightStats from './_components/HighlightStats';
import SessionList from './_components/SessionList';

export type NewUserCountResType = {
  users: Array<Partial<User>>;
  isVerified: number;
  isNotVerified: number;
};

export type ConnectedUserType = {
  user_id: string;
  expired_at: string;
  session_id: string;
};

const getNewUserCount = async (limit?: number) => {
  const accessToken = getCookies(SESSION_COOKIE_NAME);

  try {
    const response = await fetch(`${authUrl}/users/admin/new-user?limit=${limit}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: FETCH_CACHE_REVALIDATION_LONG },
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.log(error);
  }
};

const getConnectedUser = async (limit?: number) => {
  const accessToken = getCookies(SESSION_COOKIE_NAME);

  try {
    const response = await fetch(`${authUrl}/session?limit=${limit}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.log(error);
  }
};

export default async function Overview() {
  const newUsersStats: NewUserCountResType = await getNewUserCount(3000);
  const connectedUser: ConnectedUserType[] = await getConnectedUser(10);
  const user: DecodedTokenType = getUser();

  return (
    <main className="min-h-[calc(100dvh-57px)] flex flex-col m-5">
      <h1 className="text-2xl font-extrabold">Dashboard</h1>
      <h2>
        Hello&nbsp;
        <span className="text-xl font-bold">{user.name}</span>, and welcome back !
      </h2>
      <HighlightStats newUsersStats={newUsersStats} />
      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <SessionList title="Connected users" description="Recently connected users" sessions={connectedUser} />
        <UserList
          users={newUsersStats.users}
          title="New Users"
          description="List of new users registered the last 30 days"
          keys={{ val: 'created_at', desc: 'email' }}
        />
      </div>
    </main>
  );
}
