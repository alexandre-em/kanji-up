from tensorflow.keras import Sequential
from tensorflow.keras.layers import (
    Conv2D,
    Activation,
    BatchNormalization,
    MaxPooling2D,
    Dropout,
    Dense,
    Flatten,
)
from tensorflow.keras.preprocessing.image import ImageDataGenerator


EPOCHS = 4


def make_model_save(dataset_path: str, label):
    """
    Train the recognition model.

        Parameters:
            dataset_path (str): path of the dataset
            label: array of kanjis (str) used on dataset
    """
    image_size = (64, 64)
    batch_size = 256

    dataset_training_path = dataset_path + "/train"
    dataset_validation_path = dataset_path + "/val"
    dataset_test_path = dataset_path + "/test"

    def invert_color(image):
        return 255 - image

    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        rotation_range=0.05,
        zoom_range=[1.0, 2],
        preprocessing_function=invert_color,
    )

    train_batches = train_datagen.flow_from_directory(
        dataset_training_path,
        target_size=image_size,
        color_mode="grayscale",
        batch_size=batch_size,
        classes=label,
        class_mode="binary",
    )

    validation_batches = train_datagen.flow_from_directory(
        dataset_validation_path,
        target_size=image_size,
        color_mode="grayscale",
        batch_size=batch_size,
        classes=label,
        class_mode="binary",
    )

    test_batches = train_datagen.flow_from_directory(
        dataset_test_path,
        target_size=image_size,
        color_mode="grayscale",
        batch_size=batch_size,
        classes=label,
        class_mode="binary",
    )

    n_class = len(label)

    model = Sequential(
        [
            Conv2D(32, (3, 3), input_shape=(64, 64, 1)),
            Activation("relu"),
            BatchNormalization(),
            MaxPooling2D(pool_size=(2, 2)),
            Conv2D(64, (3, 3)),
            Activation("relu"),
            BatchNormalization(),
            MaxPooling2D(pool_size=(2, 2)),
            Flatten(),
            Dense(1024),
            Activation("relu"),
            BatchNormalization(),
            Dropout(0.2),
            Dense(n_class),
            Activation("softmax"),
        ]
    )

    # model.summary()
    model.compile(
        optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"]
    )

    # # Fitting the Model
    model.fit(
        train_batches, epochs=EPOCHS, verbose=True, validation_data=validation_batches
    )

    score = model.evaluate(test_batches)
    print(f"Test loss: {score[0]} / Test accuracy: {score[1]}")

    model.save("kanji_model.h5")
