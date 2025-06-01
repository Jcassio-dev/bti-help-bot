FROM node:20-alpine As builder

WORKDIR /usr/src/app


COPY package.json package-lock.json* ./

RUN npm ci --omit=dev

COPY tsconfig.json ./


COPY ./src ./src

RUN npm run build

FROM node:20-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist


COPY --from=builder /usr/src/app/src/resources ./dist/resources


COPY package.json .


CMD [ "npm", "start" ]