'use client';
import { Copy } from 'lucide-react';
import React, { useCallback } from 'react';

import updateKanjiCharacter from '@/actions/updateKanjiChar';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export default function UpdateKanjiForm({ kanji }: { kanji: KanjiType }) {
  const { toast } = useToast();

  const handleCopy = useCallback(() => {
    if (kanji.kanji.character_id) {
      navigator.clipboard.writeText(kanji.kanji.character_id).then(() => {
        toast({ title: 'Copied!', description: 'The id has been copied to the clipboard !' });
      });
    } else {
      toast({ title: 'Failed', description: 'An error occurred. Please try again...' });
    }
  }, [kanji.kanji.character_id, toast]);

  return (
    <form action={updateKanjiCharacter}>
      <DialogContent className="h-[80dvh]">
        <DialogHeader>
          <DialogTitle>Edit character</DialogTitle>
          <DialogDescription>Update all &quot;{kanji.kanji.character}&quot; character related information</DialogDescription>
        </DialogHeader>
        <div className="overflow-auto">
          <p className="mb-2">Id</p>
          <div className="flex flex-wrap">
            <Input name="character_id" value={kanji.kanji.character_id} readOnly className="w-10/12" />
            <Button type="submit" size="sm" className="px-3 h-10 rounded-l-none" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 mb-2">Character</p>
          <Input name="character" defaultValue={kanji.kanji.character} />
          <p className="mt-2 mb-2">Stroke(s)</p>
          <Input name="strokes" defaultValue={kanji.kanji.strokes} type="number" />
          <p className="mt-2 mb-2">Kunyomi</p>
          <Input name="kunyomi" defaultValue={kanji.kanji.kunyomi} />
          <p className="mt-2 mb-2">Onyomi</p>
          <Input name="onyomi" defaultValue={kanji.kanji.onyomi} />
          <p className="mt-2 mb-2" mb-1>
            Meaning(s)
          </p>
          <Input name="meaning" defaultValue={kanji.kanji.meaning} />
        </div>
        <DialogFooter>
          <Button type="submit" className="mt-2 mb-2">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </form>
  );
}
