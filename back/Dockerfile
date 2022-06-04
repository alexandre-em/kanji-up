FROM node:buster-slim
WORKDIR /api

COPY package*.json /api/
RUN npm i

COPY . /api/

ARG SAVED_MODEL_URL=$SAVED_MODEL_URL

RUN apt-get update && \ 
	apt-get install -y build-essential \
	wget \
	python3 \
	make \
	gcc \ 
	libc6-dev

RUN	mkdir -p ./kanji_saved_model/variables && \
	wget -P ./kanji_saved_model ${SAVED_MODEL_URL}/saved_model.pb && \
	wget -P ./kanji_saved_model/variables ${SAVED_MODEL_URL}/variables/variables.data-00000-of-00001 ${SAVED_MODEL_URL}/variables/variables.index

ENV AWS_ACCESS_ID=${AWS_ACCESS_ID}
ENV AWS_ACCESS_SECRET=${AWS_ACCESS_SECRET}
ENV AWS_BUCKET_NAME=${AWS_BUCKET_NAME}
ENV MONGO_URI=${MONGO_URI}
ENV MONGO_DB_NAME=${MONGO_DB_NAME}
ENV MONGO_COLLECTION=${MONGO_COLLECTION}
ENV PORT=${PORT}

EXPOSE ${PORT}
CMD ["npm", "run", "build"]
