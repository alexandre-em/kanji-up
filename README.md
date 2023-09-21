<p align="center">
  <a href="https://kanjiup.alexandre-em.fr" target="blank">
    <img src="./front/apps/kanji-up/assets/images/adaptive-icon.png" width="200" alt="KanjiUp Logo" />
  </a>
</p>
<h1 align="center">KanjiUp</h1>

# KanjiApp

![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)

## Front-end applications

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Redux](https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

### KanjiUp

[![Netlify Status](https://api.netlify.com/api/v1/badges/c8fc660d-c473-4df2-aeae-ce6454a195b2/deploy-status)](https://app.netlify.com/sites/kanjiup-v2/deploys)

KanjiUp is an application that will help the user to learn and memorize Japanese kanji with Flashcard and drawing recognition (~2600 kanji can be recognized).

Web application:

[![image](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://kanjiup-v2.alexandre-em.fr)

Android application (APK): _Last update : 9/21/2023_

[![image](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/alexandre-em/kanji-up/releases/tag/v0.0.15)

![image](./doc/images/kanjiup.png)

### KanjiUp User

[![Netlify Status](https://api.netlify.com/api/v1/badges/5f29673e-4d6d-4b94-b0f7-db3ef5e39558/deploy-status)](https://app.netlify.com/sites/kanjiappuser/deploys)

Manage User's information, friends and visualize scores, progressions

Web application:

[![image](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://user.kanjiup.alexandre-em.fr)

![image](./doc/images/kanjiup-user.png)

### KanjiUp Word (TODO)

A Japanese-english dictionnary application.
Users can add the words they want to learn and then test their uses with some quizz

### KanjiUp BackOffice (TODO)

BackOffice allowing users with the right permissions to manage (add, update or delete) kanji's information.

## Back-end services

![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

### Auth

Manage permissions based authentication to KanjiUp apps and all data related to the user's (auth side)

### KanjiUp

![build status](https://github.com/alexandre-em/kanji-up/actions/workflows/deploy-back.yaml/badge.svg)

Manage all data related to the kanji's characters

### Recognition (WIP)

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Keras](https://img.shields.io/badge/Keras-%23D00000.svg?style=for-the-badge&logo=Keras&logoColor=white)

Allows to recognize a handwritted kanji, upload new data (handwritted kanji) in order to improve the recognition model

### User (TODO?)

Manage user's data like statistics (application side)

### Word or Dict (TODO)

Manage all data related to japanese's words
