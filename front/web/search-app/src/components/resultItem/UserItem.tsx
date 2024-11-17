import React from 'react';

import { Card, CardContent } from '../ui/card';
import { Spacer, TypographyLead, TypographyMuted, TypographyP } from 'gatewayApp/shared';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export type UserType = {
  name: 'string';
  created_at: 'string';
  user_id: 'string';
};

type UserListItemProps = {
  user: UserType;
};

export default function UserListItem({ user }: UserListItemProps) {
  return (
    <Card>
      <CardContent>
        <Spacer size={1} />
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src={`${process.env.REACT_APP_AUTH_BASE_URL}/users/profile/image/${user.user_id}`} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <Spacer size={1} direction="horizontal" />
          <div className="flex flex-col">
            <TypographyLead>
              <span className="text-primary">{user.name}</span>
            </TypographyLead>
            <TypographyMuted>{user.user_id}</TypographyMuted>
            <TypographyP>Member since {new Date(user.created_at).toDateString()}</TypographyP>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
