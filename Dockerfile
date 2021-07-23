FROM node:14

WORKDIR /app

RUN apt-get -y update
RUN apt-get install -y ffmpeg

COPY package.json .
COPY yarn.lock .
COPY packages/server/package.json ./packages/server/

RUN yarn install

COPY . .
RUN yarn prisma migrate deploy
RUN yarn prisma generate

RUN yarn server:build

ENV NODE_ENV production

CMD ["yarn", "start"]
