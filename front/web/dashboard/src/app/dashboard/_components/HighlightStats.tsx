import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { NewUserCountResType } from '../page';

export default function HighlightStats({ newUsersStats }: { newUsersStats: NewUserCountResType }) {
  return (
    <div className="flex flex-row flex-wrap w-full h-fit justify-evenly mt-5">
      {/* New User registered */}
      <Card className="m-2">
        <CardHeader className="flex justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold">New users</CardTitle>
          <CardDescription className="text-xs font-normal">Registered the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{newUsersStats.users?.length || 0}</div>
          <p className="text-xs font-thin text-muted-foreground">persons</p>
        </CardContent>
      </Card>

      {/* New User registered verified */}
      <Card className="m-2">
        <CardHeader className="flex justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold">Users verified</CardTitle>
          <CardDescription className="text-xs font-normal">Registered the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{newUsersStats.isVerified}</div>
          <p className="text-xs font-thin text-muted-foreground">persons</p>
        </CardContent>
      </Card>

      {/* New User registered not verified */}
      <Card className="m-2">
        <CardHeader className="flex justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold">Users not verified</CardTitle>
          <CardDescription className="text-xs font-normal">Registered the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{newUsersStats.isNotVerified}</div>
          <p className="text-xs font-thin text-muted-foreground">persons</p>
        </CardContent>
      </Card>
    </div>
  );
}
