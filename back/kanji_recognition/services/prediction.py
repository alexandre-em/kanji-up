import numpy as np
import tensorflow as tf

from out.kanji_label import label
from utils.model import RecognitionModel

MIN_CONFIDENCE = 0.004


def kanji_prediction(path):
    """
    Parameters:
        path: path of the image file

    Returns:
        A dictionnary of predicted kanji characters
    """
    model = RecognitionModel().recognition

    if model is None:
        raise Exception("The recognition model is not yet ready")

    img_raw = tf.io.read_file(path)
    img_tensor = tf.image.decode_image(img_raw, channels=1)
    img_resized = tf.image.resize(img_tensor, [64, 64])
    img_div = tf.divide(img_resized, 255)
    img_final = tf.expand_dims(img_div, 0)

    predictions = model.predict(img_final)

    indexes = np.where(predictions[0] >= MIN_CONFIDENCE)[0]

    return [
        {
            "prediction": label[index.item()],
            "score": predictions[0][index.item()].item(),
        }
        for index in indexes
    ]
