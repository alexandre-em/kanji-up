import datetime
import time
from fastapi import APIRouter, File
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from services.prediction import kanji_prediction
from utils.file import create_dir, create_file

router = APIRouter(prefix="/api/v1/recognitions", tags=["recognitions"])


@router.put("/train")
async def train_model():
    pass


@router.post("/:kanji")
async def create_recognition(file: bytes = File(...), kanji: str = ""):
    path = "out/images/" + kanji
    create_dir(path)

    timestamp = str(int(datetime.datetime.now().timestamp()))
    # TODO: Update to dynamic filetype
    file_path = path + "/" + timestamp + ".jpg"
    create_file(file_path, file)

    time.sleep(3)
    result = kanji_prediction(path=file_path)


    return result
