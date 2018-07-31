### Build stage ###
FROM node:8.10 as builder

LABEL authors="Samuel Fernandez"

# Install Google Chrome for testing
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get -qq update \
   && apt-get -qq install google-chrome-stable=68.0.3440.75-1 -y --no-install-recommends \
   && apt-get -qq clean \
   && rm -rf /var/lib/apt/lists/*

# Set WORKDIR and install dependencies
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn --silent
RUN yarn run e2e:update-webdriver

# Copy source files and run tests
COPY . .
RUN yarn run test:ci
RUN yarn run build
RUN yarn run server &>/dev/null & sleep 5; yarn run e2e


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
