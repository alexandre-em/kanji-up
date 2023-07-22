from fastapi import FastAPI
import tensorflow as tf

from routers.recognition import recognition
from utils.model import RecognitionModel

app = FastAPI()

model = RecognitionModel()

model.recognition = tf.keras.models.load_model("kanji_model.h5")

app.include_router(recognition.router)
