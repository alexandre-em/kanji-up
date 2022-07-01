from tensorflow.keras import Sequential
from tensorflow.keras.layers import Conv2D, Activation, BatchNormalization, MaxPooling2D, Dropout, Dense, Flatten
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import matplotlib.pyplot as plt
from kanji_label import label

def invert_color(image):
    return 255-image

image_size = (64,64)
batch_size = 256

dataset_training_path = 'kanji_dataset/train'
dataset_validation_path = 'kanji_dataset/val'
dataset_test_path = 'kanji_dataset/test'

train_datagen = ImageDataGenerator(rescale=1./255, rotation_range=0.05,zoom_range=[1.0, 2], preprocessing_function=invert_color)

train_batches = train_datagen.flow_from_directory(
    dataset_training_path,
    target_size=image_size,
    color_mode='grayscale',
    batch_size=batch_size,
    classes=label,
    class_mode='binary')

validation_batches = train_datagen.flow_from_directory(
    dataset_validation_path,
    target_size=image_size,
    color_mode='grayscale',
    batch_size=batch_size,
    classes=label,
    class_mode='binary')

test_batches = train_datagen.flow_from_directory(
    dataset_test_path,
    target_size=image_size,
    color_mode='grayscale',
    batch_size=batch_size,
    classes=label,
    class_mode='binary')

def plotImages(images_arr):
    fig, axes = plt.subplots(1,15)
    axes = axes.flatten()
    for img, ax in zip(images_arr, axes):
        ax.imshow(img)
        ax.axis('off')
    plt.tight_layout()
    plt.show()

# # Check if image and labels are the same
# imgs, labels = train_batches[0]
# plotImages(imgs)
# print(labels[:15])
# print([label[int(labels[i])] for i in range(15)])

N_CLASS = len(label)

model = Sequential([
  Conv2D(32, (3,3), input_shape=(64, 64, 1)),
  Activation('relu'),
  BatchNormalization(),
  MaxPooling2D(pool_size=(2,2)),
  Conv2D(64, (3,3)),
  Activation('relu'),
  BatchNormalization(),
  MaxPooling2D(pool_size=(2,2)),
  Flatten(),
  Dense(1024),
  Activation('relu'),
  BatchNormalization(),
  Dropout(0.2),
  Dense(N_CLASS),
  Activation('softmax')
])

# model.summary()
model.compile(optimizer='adam', loss="sparse_categorical_crossentropy", metrics=['accuracy'])

EPOCHS = 4

# # Fitting the Model
history = model.fit(train_batches, epochs=EPOCHS, verbose=True, validation_data=validation_batches)

# # plot the loss and accuracy
# acc = history.history['accuracy']
# val_acc = history.history['val_accuracy']
# loss = history.history['loss']
# val_loss = history.history['val_loss']
# epochs = range(1, len(acc) + 1)

# plt.title('Training and validation accuracy')
# plt.plot(epochs, acc, 'red', label='Training acc')
# plt.plot(epochs, val_acc, 'blue', label='Validation acc')
# plt.legend()

# plt.figure()
# plt.title('Training and validation loss')
# plt.plot(epochs, loss, 'red', label='Training loss')
# plt.plot(epochs, val_loss, 'blue', label='Validation loss')

# plt.legend()
# plt.show()

score = model.evaluate(test_batches)
print(f'Test loss: {score[0]} / Test accuracy: {score[1]}')

model.save("kanji_model.h5")
