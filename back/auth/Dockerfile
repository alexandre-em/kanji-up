FROM node:buster-slim as builder
WORKDIR /auth

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:buster-slim

ENV AUTH_BASE_URL=${AUTH_BASE_URL}
ENV MONGO_URI=${MONGO_URI}
ENV PORT=${PORT}
ENV AUTH_API_SECRET_KEY=${AUTH_API_SECRET_KEY}
ENV EMAIL_USER=${EMAIL_USER}
ENV EMAIL_SENDER=${EMAIL_SENDER}
ENV EMAIL_PASSWORD=${EMAIL_PASSWORD}
ENV EMAIL_SERVICE=${EMAIL_SERVICE}

WORKDIR /auth

COPY package*.json ./

RUN npm install --only=prod

COPY . .

COPY --from=builder /auth/dist ./dist

EXPOSE ${PORT}

CMD node dist/main.js
