from fastapi import FastAPI
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf

from routers.recognition import recognition
from utils.model import RecognitionModel

app = FastAPI()

# app.add_middleware(
#     TrustedHostMiddleware,
#     allowed_hosts=[
#         "localhost",
#         "kanjiup-reco.alexandre-em.fr",
#     ],
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


model = RecognitionModel()

model.recognition = tf.keras.models.load_model("kanji_model.h5")

app.include_router(recognition.router)
