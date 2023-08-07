import datetime
import time
from fastapi import APIRouter, Depends, File
from auth.auth_bearer import JWTBearer

from out.kanji_label import label
from services.prediction import kanji_prediction
from services.train import create_data_batches, train_model
from utils.file import create_dir, create_file, delete_file

router = APIRouter(prefix="/api/v1/recognitions", tags=["recognitions"])


@router.put("/train", dependencies=[Depends(JWTBearer())], tags=["trains"])
async def train_recognition_model():
    # TODO: Find a way to take data from the cloud (S3) or download and save then to load locally
    # path = "to_define"
    # batches = create_data_batches(path, label)
    # train_model(batches)
    return "Not yet implemented"


@router.get("/health")
async def check_health():
    return "ok"


@router.post("/:kanji", dependencies=[Depends(JWTBearer())], tags=["recognitions"])
async def get_recognition(file: bytes = File(...), kanji: str = ""):
    path = "out/images/" + kanji
    create_dir(path)

    timestamp = str(int(datetime.datetime.now().timestamp()))
    # TODO: Update to dynamic filetype
    file_path = path + "/" + timestamp + ".jpg"
    create_file(file_path, file)

    time.sleep(3)
    result = kanji_prediction(path=file_path)

    delete_file(file_path)

    return result
