import tensorflow as tf

model = tf.keras.models.load_model("kanji_model.h5")


class RecognitionModel:
    __instance = None
    recognition = None

    def __new__(cls):
        if cls.__instance is None:
            cls.__instance = super(RecognitionModel, cls).__new__(cls)

        return cls.__instance
