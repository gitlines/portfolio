### Build stage ###
FROM node:8.10 as builder

LABEL authors="Samuel Fernandez"

# Install Google Chrome for testing
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get -qq update \
   && apt-get -qq install google-chrome-stable -y --no-install-recommends \
   && apt-get -qq clean \
   && rm -rf /var/lib/apt/lists/* \
   && npm install -g npm@latest

# Set WORKDIR and install dependencies
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files and run tests
COPY . .
ARG HOST
ENV HOST ${HOST:-http://localhost:5000/}
RUN echo $HOST
RUN npm run test:ci
RUN npm run build
RUN npm run sitemap -- --host=$HOST
RUN npm run server &>/dev/null; npm run e2e:update-webdriver; npm run e2e


### Server stage ###
FROM node:8.10-alpine as server

# Set node in production mode
ENV NODE_ENV=production

# Install dumb-init to handle termination signals
ADD https://github.com/Yelp/dumb-init/releases/download/v1.1.1/dumb-init_1.1.1_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

# Set WORKDIR and copy compiled files
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist .

# Run as a non-root user
USER node

# Launch the server
CMD ["dumb-init", "node", "server.js"]
