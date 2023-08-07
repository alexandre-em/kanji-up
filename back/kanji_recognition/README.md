# KanjiUp recognition service

## Install local

First, create a virtual environment and install the project dependencies.

```sh
    python3 -m venv env
    source ./env/bin/activate
    pip install -r requirements.txt

    # Or with poetry
    poetry install
```

To generate the requirements.txt

```sh
    poetry install
    poetry export --without-hashes --format=requirements.txt > requirements.txt
```

To build docker image

```sh
    docker build --build-arg KANJI_RECOGNIZER_DL_URL=<string> -t alexandreem22/recognition:<version> .
```
