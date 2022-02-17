import multer, {Multer, StorageEngine} from "multer";
import express from "express";
import path from 'path';

export function uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
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
