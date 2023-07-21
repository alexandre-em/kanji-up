import datetime
import time
import numpy as np
import tensorflow as tf

from fastapi import APIRouter, File

from .kanji_label import label

router = APIRouter(prefix="/api/v1/recognitions", tags=["recognitions"])

model = tf.keras.models.load_model("kanji_model.h5")


@router.put("/train")
async def train_model():
    pass


@router.post("/:kanji")
async def create_recognition(file: bytes = File(...), kanji: str = ""):
    path = (
        "out/images/" + kanji + "_" + str(datetime.datetime.now().timestamp()) + ".jpg"
    )

    with open(path, "wb") as image:
        image.write(file)
        image.close()

    time.sleep(3)

    img_raw = tf.io.read_file(path)
    img_tensor = tf.image.decode_image(img_raw, channels=1)
    img_resized = tf.image.resize(img_tensor, [64, 64])
    img_div = tf.divide(img_resized, 255)
    img_final = tf.expand_dims(img_div, 0)

    predictions = model.predict(img_final)

    indexes = np.where(predictions[0] >= 0.004)[0]
    print([label[index] for index in indexes])
    print([predictions[0][index] for index in indexes])
    result = predictions.argmax()
    print(label[result])

    return "ok"
