# KanjiApp

![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)

## Front-end applications

### KanjiUp

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Redux](https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

[![Netlify Status](https://api.netlify.com/api/v1/badges/c8fc660d-c473-4df2-aeae-ce6454a195b2/deploy-status)](https://app.netlify.com/sites/kanjiup-v2/deploys)

KanjiUp is an application that will help the user to learn and memorize Japanese kanji with Flashcard and drawing recognition (~2600 kanji can be recognized).
Web application: [link](https://kanjiup-v2.alexandre-em.fr)
Android application (APK): [link](https://expo.dev/accounts/em-alexandre/projects/kanji-up/builds/589180b0-1839-4333-b05f-d221d3cb628c)

See KanjiUp [Readme](./front/apps/kanji-up/README.md)

### KanjiUp Image Data Manager (OUT?)

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

[![Netlify Status](https://api.netlify.com/api/v1/badges/46972eda-d0d9-4410-a6c3-3ed245938821/deploy-status?branch=main)](https://app.netlify.com/sites/kaleidoscopic-kitsune-1e1cf1/deploys)

KanjiUp Mng is the back office for the KanjiUp application allowing to draw kanji to train the recognition model with new data, it also allows to manage user's reported bugs and to manage user's data contributions.

See KanjiUp Mng [Readme](./front/kanji-mng/README.md)

### KanjiUp Word (TODO)

A Japanese-english dictionnary application.
Users can add the words they want to learn and then test their uses with some quizz

### KanjiUp BackOffice (TODO)

BackOffice allowing users with the right permissions to manage (add, update or delete) kanji's information.

## Back-end services

### Auth

![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

Manage permissions based authentication to KanjiUp apps and all data related to the user's (auth side)

### KanjiUp

![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

![build status](https://github.com/alexandre-em/kanji-up/actions/workflows/deploy-back.yaml/badge.svg)

Manage all data related to the kanji's characters

### Recognition (WIP)

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Keras](https://img.shields.io/badge/Keras-%23D00000.svg?style=for-the-badge&logo=Keras&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

Allows to recognize a handwritted kanji, upload new data (handwritted kanji) in order to improve the recognition model

### User (TODO?)

Manage user's data like statistics (application side)

### Word or Dict (TODO)

Manage all data related to japanese's words
