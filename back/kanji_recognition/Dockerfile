FROM python:3.11.3

WORKDIR /recognition

RUN apt-get -y update && apt-get -y install curl

# COPY pyproject.toml .
COPY requirements.txt .
# RUN pip3 install poetry && poetry config virtualenvs.create false && poetry install
RUN pip3 install -r requirements.txt

ARG KANJI_RECOGNIZER_DL_URL
ENV KANJI_RECOGNIZER_DL_URL=${KANJI_RECOGNIZER_DL_URL}
ARG AUTH_API_SECRET_KEY
ENV AUTH_API_SECRET_KEY=${AUTH_API_SECRET_KEY}

COPY . .
RUN curl "https://${KANJI_RECOGNIZER_DL_URL}/models/kanji_model.h5" \
    -H "authority: ${KANJI_RECOGNIZER_DL_URL}" \
    -H 'origin: https://kanjiup.alexandre-em.fr' \
    -H 'referer: https://kanjiup.alexandre-em.fr/' \
    --compressed \
    --output ./kanji_model.h5

EXPOSE 10000

CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "main:app", "--bind", "0.0.0.0:10000"]
