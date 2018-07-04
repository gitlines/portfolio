## Build stage
FROM node:8.10-alpine as builder
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn --silent
COPY . .
RUN npm run build

## Server
FROM node:8.10-alpine as server
WORKDIR /usr/src/app
COPY package.json ./
COPY --from=builder /usr/src/app/dist .
RUN adduser -D www-data
USER www-data
CMD npm run server
