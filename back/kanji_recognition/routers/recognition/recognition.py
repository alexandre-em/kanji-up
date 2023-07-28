import datetime
import time
from fastapi import APIRouter, File

from out.kanji_label import label
from services.prediction import kanji_prediction
from services.train import create_data_batches, train_model
from utils.file import create_dir, create_file

router = APIRouter(prefix="/api/v1/recognitions", tags=["recognitions"])


@router.put("/train")
async def train_recognition_model():
    # TODO: Find a way to take data from the cloud (S3) or download and save then to load locally
    path = "to_define"
    batches = create_data_batches(path, label)
    train_model(batches)

    return "ok"


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
