#!/bin/sh

# /!\ Before executing the script, set the env variables

# Download models files
curl "https://${KANJI_RECOGNIZER_DL_URL}/models/kanji_model.tflite" \
    -H "authority: ${KANJI_RECOGNIZER_DL_URL}" \
    -H 'origin: https://kanjiup.alexandre-em.fr' \
    -H 'referer: https://kanjiup.alexandre-em.fr/' \
    --compressed \
    --output ./src/hooks/usePrediction/kanji_model.tflite

# Build project
yarn build:web
