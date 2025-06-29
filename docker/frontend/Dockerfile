FROM node:20.0.0-alpine

WORKDIR /app

COPY client/package*.json ./

RUN npm install

COPY client .

EXPOSE 5173