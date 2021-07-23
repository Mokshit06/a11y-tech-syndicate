FROM node:14

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY packages/server/package.json ./packages/server/

RUN yarn install

COPY . .

RUN yarn build

ENV NODE_ENV production

EXPOSE 8000

CMD ["yarn", "start"]