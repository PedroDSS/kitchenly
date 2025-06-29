FROM node:20.0.0-alpine

WORKDIR /src

COPY server/package*.json ./

RUN npm install

COPY server .

EXPOSE 3000