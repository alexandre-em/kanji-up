import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { ConnectedUserType } from '../page';

type SessionListProps = {
  title: string;
  description: string;
  sessions: ConnectedUserType[];
};

export default function SessionList({ title, description, sessions }: SessionListProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>
          {title} ({sessions.length})
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.map((session) => (
          <div className="flex flex-wrap items-center cursor-pointer my-2" key={session.session_id}>
            <p className="text-sm font-medium leading-none">{session.user_id}</p>
            <div className="ml-auto font-thin text-xs italic">{new Date(session.expired_at).toDateString()}</div>
          </div>
        ))}
        {sessions.length === 0 && <p className="text-center">No user connected the last 3 days</p>}
      </CardContent>
    </Card>
  );
}
