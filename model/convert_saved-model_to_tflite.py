import tensorflow as tf

# Convert the model
converter = tf.lite.TFLiteConverter.from_saved_model('./kanji_saved_model') # path to the SavedModel directory
tflite_model = converter.convert()

# Save the model.
with open('kanji_model.tflite', 'wb') as f:
  f.write(tflite_model)

