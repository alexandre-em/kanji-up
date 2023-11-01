FROM node:buster-slim as builder
WORKDIR /word

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:buster-slim

ENV AUTH_BASE_URL=${AUTH_BASE_URL}
ENV MONGO_URI=${MONGO_URI}
ENV PORT=${PORT}
ENV AUTH_API_SECRET_KEY=${AUTH_API_SECRET_KEY}

WORKDIR /word

COPY package*.json ./

RUN npm install --only=prod

COPY . .

COPY --from=builder /word/dist ./dist

EXPOSE ${PORT}

CMD node dist/main.js
