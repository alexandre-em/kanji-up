import numpy as np

import tensorflow as tf
from keras.preprocessing.image import ImageDataGenerator

from kanji_label import label

path_saved_model = 'kanji_saved_model'

dataset_test_path = 'kanji_dataset/test'

model = tf.keras.models.load_model('kanji_model.h5')

def predict_kanji(image_path):
    print(image_path)
    img_raw = tf.io.read_file(image_path)
    img_tensor = tf.image.decode_image(img_raw, channels=1)
    img_resized = tf.image.resize(img_tensor, [64,64])
    img_div = tf.divide(img_resized, 255)
    img_final = tf.expand_dims(img_div, 0)

    predictions = model.predict(img_final)

    indexes = np.where(predictions[0] >= 0.004)[0]
    print([index for index in indexes])
    print([label[index] for index in indexes])
    print([predictions[0][index] for index in indexes])
    result = predictions.argmax()
    print(label[result])

predict_kanji('/home/alexandre/Pictures/kanji/1.jpeg')
predict_kanji('/home/alexandre/Pictures/kanji/12.jpeg')
predict_kanji('/home/alexandre/Pictures/kanji/13.jpg')
predict_kanji('/home/alexandre/Pictures/kanji/2.jpg')

tf.saved_model.save(model, path_saved_model)
