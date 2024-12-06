'use client';
import React, { useCallback } from 'react';

import { authUrl } from '@/constants';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

type UserListProps = {
  users: Array<Partial<User>>;
  title: string;
  description: string;
  keys: {
    desc: keyof User;
    val: keyof User;
  };
  onClick?: (user: Partial<User>) => void;
};

export default function UserList({ users, title, description, keys, onClick }: UserListProps) {
  const handleClick = useCallback(
    (user: Partial<User>) => {
      if (onClick) {
        onClick(user);
      }
    },
    [onClick]
  );

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {users.map((user) => (
          <div className="flex flex-wrap items-center cursor-pointer" key={user.user_id} onClick={() => handleClick(user)}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={`${authUrl}/users/profile/image/${user.user_id}`} alt="Avatar" />
              <AvatarFallback>{user.name?.charAt(0) || '-'}</AvatarFallback>
            </Avatar>
            <div className="ml-4 my-2 space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user[keys.desc] as string}</p>
            </div>
            <div className="ml-auto font-thin text-xs italic">{user[keys.val] as string}</div>
          </div>
        ))}
        {users.length === 0 && <p className="text-center">No user registered the last 30 days</p>}
      </CardContent>
    </Card>
  );
}
