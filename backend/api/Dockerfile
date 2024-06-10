FROM node:lts-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl

COPY package.json .
COPY tsconfig.json .

RUN npm install
RUN npm install typescript -g

COPY . .

RUN mkdir -p /app/logs

RUN npm run build


CMD ["node", "dist/app.js"]