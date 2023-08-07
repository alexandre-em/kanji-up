from tensorflow.keras.preprocessing.image import ImageDataGenerator

from utils.model import RecognitionModel


EPOCHS = 4


def create_data_batches(dataset_path: str, label):
    """
    Generate train, validation and test batches of tensor image data

        Parameters:
            dataset_path (str): Path of the directory containing the splitted data
            label (str): array of kanji value
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

    return [train_batches, validation_batches, test_batches]


def train_model(batches):
    """
    Train the recognition model.

        Parameters:
            batches (arr): batches of tensor image data (train index [0], validation [1], test [2])
    """

    [train_batches, validation_batches, test_batches] = batches

    model = RecognitionModel().recognition

    if model is None:
        raise Exception("The recognition model is not yet ready")

    # # Fitting the Model
    model.fit(
        train_batches, epochs=EPOCHS, verbose=True, validation_data=validation_batches
    )

    score = model.evaluate(test_batches)
    print(f"Test loss: {score[0]} / Test accuracy: {score[1]}")

    model.save("kanji_model.h5")
