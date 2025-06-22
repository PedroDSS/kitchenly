FROM node:20.0.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install && npm install -g sequelize-cli

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]