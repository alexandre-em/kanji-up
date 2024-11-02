'use client';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useState } from 'react';

import DarkModeButton from '@/components/DarkModeButton';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from '@/components/ui/use-toast';
import useAuth from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

function NavbarMenu({ className, onClick }: { className?: string; onClick?: () => void }) {
  const { handleSignOut } = useAuth();

  const handleLogOut = useCallback(() => {
    handleSignOut();

    if (onClick) onClick();

    toast({
      description: 'See you soon !',
      title: 'You have been successfully logged out ',
    });
  }, [handleSignOut, onClick]);

  return (
    <NavigationMenuList className={className}>
      <NavigationMenuItem className="m-1 w-full">
        <Link className="sm:w-full" href={`/dashboard`} legacyBehavior passHref>
          <NavigationMenuLink onClick={onClick} className={cn(navigationMenuTriggerStyle(), 'w-full')}>
            Home
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem className="m-1 w-full">
        <Link className="sm:w-full" href={`/kanji`} legacyBehavior passHref>
          <NavigationMenuLink onClick={onClick} className={cn(navigationMenuTriggerStyle(), 'w-full')}>
            Kanji
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem className="m-1 w-full">
        <Link href={`/word`} legacyBehavior passHref>
          <NavigationMenuLink onClick={onClick} className={cn(navigationMenuTriggerStyle(), 'w-full')}>
            Word
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem className="m-1 w-full">
        <Link href={`/user`} legacyBehavior passHref>
          <NavigationMenuLink onClick={onClick} className={cn(navigationMenuTriggerStyle(), 'w-full')}>
            User
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem className="m-1 w-full">
        <Link href={`/app`} legacyBehavior passHref>
          <NavigationMenuLink onClick={onClick} className={cn(navigationMenuTriggerStyle(), 'w-full')}>
            Application
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem className="m-1 w-full">
        <Button className="sm:rounded-3xl rounded-md m-1 w-full" onClick={handleLogOut}>
          Logout
        </Button>
      </NavigationMenuItem>
    </NavigationMenuList>
  );
}

export default function Navbar() {
  const { handleSignOut } = useAuth();
  const [open, setOpen] = useState<boolean | undefined>(false);

  return (
    <>
      <NavigationMenu className="p-2 min-w-full h-[56px] bg-background justify-between">
        {/*Left*/}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image src="/images/logo.png" alt="logo" width={40} height={40} />
            <h1 className="scroll-m-20 text-xl font-extrabold tracking-tight mr-4">KanjiUp</h1>
          </Link>
          <DarkModeButton className="hidden sm:flex" />
        </div>

        {/*Right Laptop*/}
        <NavbarMenu className="hidden sm:flex" />

        {/*Right Smartphone*/}
        <Sheet>
          <SheetTrigger className="flex justify-center items-center sm:hidden w-[46px] h-[46px] rounded-2xl">
            <Menu />
          </SheetTrigger>
          <SheetContent>
            <SheetHeader className="mb-3">
              <SheetTitle>Dashboard</SheetTitle>
              <Separator />
            </SheetHeader>
            <NavbarMenu className="flex flex-col w-full" onClick={() => setOpen(false)} />
            <SheetFooter className="flex flex-row justify-between mt-[calc(100vh-329px)]">
              <Button variant="ghost" onClick={() => handleSignOut()}>
                Logout
              </Button>
              <div className="flex">
                <DarkModeButton className="mr-3" />
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </NavigationMenu>
      <Separator />
    </>
  );
}
