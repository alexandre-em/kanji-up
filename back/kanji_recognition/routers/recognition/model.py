from pydantic import BaseModel


class ImageUpload(BaseModel):
    kanji: str
