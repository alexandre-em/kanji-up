import multer, { Multer, StorageEngine } from "multer";
import express from "express";
import path from 'path';

import { UpdateKanjiProps } from "../types/enums";

export const selectElement = (type: UpdateKanjiProps, data: CharacterType | RadicalType | ReferenceType): Partial<KanjiType> => {
    switch (type) {
        case UpdateKanjiProps.UPDATE_CHARACTER:
            return { kanji: data as CharacterType };
        case UpdateKanjiProps.UPDATE_RADICAL:
            return { radical: data as RadicalType };
        case UpdateKanjiProps.UPDATE_REFERENCE:
            return { reference: data as ReferenceType };
        default:
            return null;
    }
}

// Local File storage configuration
const storage: StorageEngine = multer.diskStorage({
    destination: (req: express.Request, file: Express.Multer.File, cb) => {
        cb(null, 'uploads');
    }, filename(req: express.Request, file: Express.Multer.File, callback: (error: (Error | null), filename: string) => void) {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})

export const upload: Multer = multer({ storage });
