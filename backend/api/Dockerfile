FROM node:lts-slim

WORKDIR /app

COPY app.ts .
COPY package.json .
COPY tsconfig.json .
COPY openapi.json .

RUN apt install

RUN npm install
RUN npm install typescript -g
RUN tsc


CMD ["npm", "start"]