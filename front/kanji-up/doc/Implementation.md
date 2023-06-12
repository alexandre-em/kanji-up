<p align="center">
  <a href="https://kanjiup.alexandre-em.fr" target="blank">
    <img src="../assets/adaptive-icon.png" width="200" alt="KanjiUp Logo" />
  </a>
</p>
<h1 align="center">KanjiUp</h1>

# User workflow

The user is not connected, so it will be redirected (or open a web browser on app, in the case of the native application) on the Sign in page of the `KanjiUp Auth API` to be able to login or create an account.
Once the user connected, it will have an access token that will expire within 3 days.

> This application is using two different APIs. The authentication API [README](../../../back/auth/README.md) and the KanjiUp API [README](../../../back/kanjiup/README.md)

This application does not require any permissions, so it will not be used on any API call beside the user info synchronization and loading of the previous data when reinstalling the application.

The user can now access the application and select or search kanji to start learning with a Flashcard game and then evaluate himself with a Kanji drawing game that will try to recognize the drawed kanji.

## Kanji Selection

The user can from the Kanji List screen, select and unselect multiples kanji at the time, see the detail of the kanji, containing the meaning in english, the readings, the stroke count, some examples, etc. On the web application (currently searching a solution for the native app), the image is also animated (source KanjiVG) so the user can learn the stroke drawing order.

## Kanji Search

The user can also search a specific Kanji by inserting the meaning, readings or the kanji itself. It will return a list of kanji, so the user can then go to the detail of the wanted kanji to select it.

## Flashcard

The application randomly display some kanji and the user has to find the meaning and the reading of this kanji. The solution can be saw to check the answer by returning the card.

## Evaluation

The application randomly display some reading/meaning and the user has to draw the corresponding kanji with the right number of strokes. Even the drawed kanji look to be identical to the solution, if the drawed stroke is incorrect then it will be counted as a wrong answer.
The score is based on the prediction scores and on the difficulty (grade) of the kanji. If the Kanji can not be recognized, ie. it is not included on the kanji recognizer model's label list, then it is only based on the difficulty and the correctness of the strokes drawed

# Implementation

## Redux state

- `message`: Allow to send event and show an error catched or a message (warning, success, etc.) snackbar with the corresponding color through the application
- `selectedKanji`: Allow to store and manage the user's kanji selection and avoid to call the API when the user is playing with the flashcard and the drawing game
- `settings`: Allow to store and manage the application settings and apply through it
- `user`: Allow to store the user results from the drawing game, its score on the day and the total

## Kanji recognition

At first, the model was included on the API and the user had to upload each kanji drawed to the API. But it was costy to deploy such API, so we decided to include the model on the application using TensorflowJs.

### Image upload

To upload the image to the API, we have to send a `form-data` data containing the image and a JSON containing the kanji information so the results could be stored on the user table (DB) and the image on AWS S3, so we could maybe use it to enhanced the model results by training it with this new data. We have remove all of this and currently nothing is send to the API (maybe in the future the final score)

The image uploading on web and native are pretty different, while on the web we can send the picture on Blob format, it is impossible to reproduce this on native because Blob is does not exist on native and is not supported.
So we had to save the picture locally on the FileSystem of Expo with a base64 encoding and send the`form-data` containing the file path instead of a Blob (for web version), with a format like :

```js
// uri: saved picture path; name: new name of the picture file; type: image type
const file = { uri, name, type: "image/jpeg" };

const formData = new FormData();
formData.append("image", file);
```

### Kanji recognition model

To use our kanji recognition model, we are currently using TensorflowJs, Tfjs-tflite for the web application and tfjs-react-native for the native.
The model and its weights are stored on aws S3 storage, and are downloaded at the first run of the application then stored, so the user will not have to download it twice.
