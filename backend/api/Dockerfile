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
COPY ./middleware ./middleware
COPY ./models ./models
COPY ./queues ./queues
COPY ./repository ./routes
COPY ./routes ./routes
COPY ./utils ./utils
COPY app.ts .

# crea la cartella per i log connessa al volume
RUN mkdir -p /app/logs

RUN npm run build


CMD ["node", "dist/app.js"]