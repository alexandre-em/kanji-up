import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import AuthButton from './_components/AuthButton';

export default function Home() {
  return (
    <main className="min-h-[calc(100dvh-57px)] flex justify-center items-center">
      <Card>
        <CardHeader>
          <CardTitle>Admin page</CardTitle>
          <CardDescription>You are trying to access to a protected route. Please authenticate.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthButton />
        </CardContent>
      </Card>
    </main>
  );
}
