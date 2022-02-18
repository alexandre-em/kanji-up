export type CharacterType = {
    id: string;
    character: string;
    meaning: Array<string>;
    onyomi: Array<string>;
    kunyomi: Array<string>;
    strokes: number;
    image: {
        contentType: string;
        data: Buffer;
    };
}
