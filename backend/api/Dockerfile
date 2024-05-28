FROM node:lts-stretch-slim

WORKDIR /app

COPY app.ts .
COPY package.json .
COPY tsconfig.json .

RUN npm install
RUN npm install typescript -g
RUN tsc

EXPOSE 3000

CMD ["npm", "start"]