PYTHON = python3
PIP = pip3
SHELL := /bin/bash
HIRAGANA = ./extract/あ  ./extract/い  ./extract/う  ./extract/え  ./extract/お  ./extract/か  ./extract/が  ./extract/き  ./extract/ぎ  ./extract/く  ./extract/ぐ  ./extract/け  ./extract/げ  ./extract/こ  ./extract/ご  ./extract/さ  ./extract/ざ  ./extract/し  ./extract/じ  ./extract/す  ./extract/ず  ./extract/せ  ./extract/ぜ  ./extract/そ  ./extract/ぞ  ./extract/た  ./extract/だ  ./extract/ち  ./extract/ぢ  ./extract/つ  ./extract/づ  ./extract/て  ./extract/で  ./extract/と  ./extract/ど  ./extract/な  ./extract/に  ./extract/ぬ  ./extract/ね  ./extract/の  ./extract/は  ./extract/ば  ./extract/ぱ  ./extract/ひ  ./extract/び  ./extract/ぴ  ./extract/ふ  ./extract/ぶ  ./extract/ぷ  ./extract/へ  ./extract/べ  ./extract/ぺ  ./extract/ほ  ./extract/ぼ  ./extract/ぽ  ./extract/ま  ./extract/み  ./extract/む  ./extract/め  ./extract/も  ./extract/や  ./extract/ゆ  ./extract/よ  ./extract/ら  ./extract/り  ./extract/る  ./extract/れ  ./extract/ろ  ./extract/わ  ./extract/を  ./extract/ん

all: kanji_saved_model

env:
	$(PYTHON) -m venv ./env

install: env
	cd ./env/bin && source activate && cd ../../
	$(PIP) install -r requirements.txt

extract: install
	$(PYTHON) extract.py

kanji_label.txt: extract
	rm -dfr $(HIRAGANA)
	$(PYTHON) check_images.py
	ls extract > kanji_label.txt

kanji_dataset: extract
	$(PYTHON) split_images.py

kanji_model.h5: kanji_dataset kanji_label.txt
	$(PYTHON) generate_kanji_model.py

kanji_saved_model: kanji_model.h5
	rm -dfr ../back/kanjiup/kanji_saved_model
	$(PYTHON) keras_to_tf_saved_model.py
	mv kanji_saved_model ../back/kanjiup/

clean:
	rm -f kanji_model.h5 kanji_label.txt
	rm -dfr env kanji_saved_model extract kanji_dataset

.PHONY: all clean install extract
