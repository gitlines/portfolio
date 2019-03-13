### Build stage ###
FROM samuelfernandez/docker-node-chrome:8.14.0 as builder

LABEL authors="Samuel Fernandez"

# Set WORKDIR and install dependencies
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files and run tests
COPY . .

# Set node in production mode
ENV NODE_ENV=production

RUN npm run test:ci
RUN npm run build
RUN npm run server & npm run sitemap


### Server stage ###
FROM node:8.14.0-alpine as server

# Set node in production mode
ENV NODE_ENV=production

# Install dumb-init to handle termination signals
ADD https://github.com/Yelp/dumb-init/releases/download/v1.1.1/dumb-init_1.1.1_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

# Set WORKDIR and copy compiled files and .env
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist /usr/src/app/.env* /usr/src/app/package.json /usr/src/app/package-lock.json ./
RUN npm ci --only=production

# Run as a non-root user
USER node

# Launch the server
CMD ["dumb-init", "node", "server.js"]
