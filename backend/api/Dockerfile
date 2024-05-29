FROM node:lts-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl

COPY openapi.json ./dist/openapi.json
COPY package.json .
COPY tsconfig.json .

RUN npm install
RUN npm install typescript -g

COPY ./controller ./controller
COPY ./db ./db
COPY ./factory ./factory
COPY ./models ./models
COPY ./queues ./queues
COPY ./utils ./utils
COPY app.ts .


RUN npm run build


CMD ["node", "dist/app.js"]