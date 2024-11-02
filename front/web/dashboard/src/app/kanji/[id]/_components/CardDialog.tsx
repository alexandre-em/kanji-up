import React, { PropsWithChildren } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

type CardDialogProps = {
  title: string;
};

export default function CardDialog({ title, children }: CardDialogProps & PropsWithChildren) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="m-1">
          {title}
        </Button>
      </DialogTrigger>
      {children}
    </Dialog>
  );
}
