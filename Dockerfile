FROM node:20-alpine

LABEL maintainer="charu.rajput@speqto.com"

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]

