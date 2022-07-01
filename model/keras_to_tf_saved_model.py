import numpy as np

import tensorflow as tf
from keras.preprocessing.image import ImageDataGenerator

from kanji_label import label

path_saved_model = 'kanji_saved_model'

dataset_test_path = 'kanji_dataset/test'

model = tf.keras.models.load_model('kanji_model.h5')

tf.saved_model.save(model, path_saved_model)
