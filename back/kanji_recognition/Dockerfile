FROM python:3.11.3

WORKDIR /recognition

RUN apt-get -y update && apt-get -y install curl

COPY pyproject.toml .
RUN pip3 install poetry
RUN poetry config virtualenvs.create false
RUN poetry install

ARG KANJI_RECOGNIZER_DL_URL
ENV KANJI_RECOGNIZER_DL_URL=${KANJI_RECOGNIZER_DL_URL}

RUN echo ${KANJI_RECOGNIZER_DL_URL}

COPY . .
RUN curl "https://${KANJI_RECOGNIZER_DL_URL}/models/kanji_model.h5" \
    -H "authority: ${KANJI_RECOGNIZER_DL_URL}" \
    -H 'origin: https://kanjiup.alexandre-em.fr' \
    -H 'referer: https://kanjiup.alexandre-em.fr/' \
    --compressed \
    --output ./kanji_model.h5

CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "main:app", "--bind", "0.0.0.0:8000"]
