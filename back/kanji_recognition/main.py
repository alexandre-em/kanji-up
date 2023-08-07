from fastapi import FastAPI
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import tensorflow as tf

from routers.recognition import recognition
from utils.model import RecognitionModel

app = FastAPI()

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[
        "192.168.49.2",
        "localhost",
        "kanjiup.alexandre-em.fr",
        "kanjiup-api.alexandre-em.fr",
    ],
)

model = RecognitionModel()

model.recognition = tf.keras.models.load_model("kanji_model.h5")

app.include_router(recognition.router)
