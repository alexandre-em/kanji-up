'use client';
import { TrashIcon } from 'lucide-react';
import React, { useCallback } from 'react';

import deleteKanjiExample from '@/actions/deleteKanjiExample';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

type ExampleListCardProps = {
  kanji: KanjiType;
};

export default function ExampleListCard({ kanji }: ExampleListCardProps) {
  const removeExample = useCallback(
    async (index: number) => {
      try {
        await deleteKanjiExample(kanji.kanji_id, index);

        toast({ title: 'Success', description: `Example #${index} removed` });
      } catch (e) {
        toast({ title: 'An error occurred', description: `${e}`, variant: 'destructive' });
      }
    },
    [kanji.kanji_id]
  );

  if (!kanji.examples?.length || kanji.examples.length < 0) return <div>No examples founded</div>;

  return (
    <Dialog>
      {kanji.examples.map((expl, index) => (
        <>
          <Card key={expl.meaning + index} className="p-3 m-1 flex flex-wrap justify-between">
            <div>
              <h3 className=" text-sm font-bold">
                #{index}. {expl.japanese}
              </h3>
              <h4 className="text-xs">{expl.meaning}</h4>
            </div>
            <DialogTrigger>
              <Button className="rounded-full" variant="outline">
                <TrashIcon className="w-4 text-muted" />
              </Button>
            </DialogTrigger>
          </Card>
          <DialogContent>
            <DialogTitle>Are you sure to remove example #{index} ?</DialogTitle>
            <DialogDescription>
              {expl.japanese} / {expl.meaning}
            </DialogDescription>
            <DialogFooter>
              <Button onClick={() => removeExample(index)}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </>
      ))}
    </Dialog>
  );
}
