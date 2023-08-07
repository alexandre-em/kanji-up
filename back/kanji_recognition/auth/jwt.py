import jwt
import time

from decouple import config


def decode_jwt(token: str) -> dict:
    secret = config("AUTH_API_SECRET_KEY")

    try:
        decoded_token = jwt.decode(token, secret, algorithms=["HS256"])
        return decoded_token if decoded_token["exp"] >= time.time() else None
    except Exception as inst:
        return {}
