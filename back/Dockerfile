FROM node:18.2.0-alpine
WORKDIR /api
COPY package*.json /api/
RUN npm i
COPY . /api/
EXPOSE 5000
CMD ["npm", "run", "start"]
