from fastapi import FastAPI
from routers.recognition import recognition

app = FastAPI()

app.include_router(recognition.router)
