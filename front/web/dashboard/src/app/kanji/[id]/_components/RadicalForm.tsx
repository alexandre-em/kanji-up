'use client';
import { Copy, UploadIcon } from 'lucide-react';
import React, { useCallback, useState } from 'react';

import createKanjiRad from '@/actions/createKanjiRad';
import updateKanjiRad from '@/actions/updateKanjiRad';
import uploadKanjiImage from '@/actions/uploadKanjiImage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export default function RadicalForm({ id, kanji }: { id: string; kanji?: KanjiType }) {
  const { toast } = useToast();
  const [image, setImage] = useState<File | null>(null);

  const handleCopy = useCallback(() => {
    if (kanji?.radical?.radical_id) {
      navigator.clipboard.writeText(kanji?.radical?.radical_id).then(() => {
        toast({ title: 'Copied!', description: 'The id has been copied to the clipboard !' });
      });
    } else {
      toast({ title: 'Failed', description: 'An error occurred. Please try again...' });
    }
  }, [kanji?.radical?.radical_id, toast]);

  const handleChangeImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files?.item(0));
    }
  }, []);

  const titleAction = kanji?.radical?.radical_id ? 'Edit' : 'Create';

  return (
    <DialogContent className="h-[80dvh]">
      <DialogHeader>
        <DialogTitle>{titleAction} radical</DialogTitle>
        <DialogDescription>
          {titleAction} all &quot;{kanji?.radical?.character}&quot; radical related information
        </DialogDescription>
        {kanji?.radical?.radical_id && (
          <form action={uploadKanjiImage} className="flex flex-wrap justify-between items-center px-3">
            <label htmlFor="input_file">
              <Avatar className="w-20 h-20 cursor-pointer">
                <AvatarImage src={image ? URL.createObjectURL(image) : kanji?.radical?.image} />
                <AvatarFallback>{kanji?.radical?.character}</AvatarFallback>
              </Avatar>
            </label>
            <Input
              name="id"
              value={kanji?.radical?.radical_id}
              readOnly
              className="hidden"
              disabled={!kanji?.radical?.radical_id}
            />
            <Input name="type" value="radicals" readOnly className="hidden" />
            <input id="input_file" className="hidden" type="file" name="file" accept="image/*" onChange={handleChangeImage} />
            <Button type="submit" disabled={!image} variant="secondary">
              <UploadIcon className="mr-2" />
              Upload
            </Button>
          </form>
        )}
      </DialogHeader>
      <form action={kanji?.radical?.radical_id ? updateKanjiRad : createKanjiRad}>
        <div className="overflow-auto">
          <Input name="kanji_id" value={id} readOnly className="hidden" />
          <p className="mb-2">Id</p>
          <div className="flex flex-wrap">
            <Input
              name="radical_id"
              value={kanji?.radical?.radical_id}
              readOnly
              className="w-10/12"
              disabled={!kanji?.radical?.radical_id}
            />
            <Button type="submit" size="sm" className="px-3 h-10 rounded-l-none" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 mb-2">Character</p>
          <Input name="character" defaultValue={kanji?.radical?.character} />
          <p className="mt-2 mb-2">Stroke(s)</p>
          <Input name="strokes" defaultValue={kanji?.radical?.strokes} type="number" />
          <p className="mt-2 mb-2">Name in romaji</p>
          <Input name="romaji" defaultValue={kanji?.radical?.name?.romaji} />
          <p className="mt-2 mb-2">Name in Hiragana</p>
          <Input name="hiragana" defaultValue={kanji?.radical?.name?.hiragana} />
          <p className="mt-2 mb-2" mb-1>
            Meaning(s)
          </p>
          <Input name="meaning" defaultValue={kanji?.radical?.meaning} />
        </div>
        <DialogFooter>
          <Button type="submit" className="mt-2 mb-2">
            Save changes
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
