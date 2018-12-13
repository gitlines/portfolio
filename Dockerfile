### Build stage ###
FROM node:8.14.0 as builder

LABEL authors="Samuel Fernandez"

# Install Google Chrome for testing
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get -qq update \
   && apt-get -qq install google-chrome-stable -y --no-install-recommends \
   && apt-get -qq clean \
   && rm -rf /var/lib/apt/lists/*

# Installation downloading deb package to workaround issue https://github.com/angular/protractor/issues/5077
RUN wget -O google-chrome-stable.deb http://www.slimjetbrowser.com/chrome/files/70.0.3538.77/google-chrome-stable_current_amd64.deb
RUN dpkg -i google-chrome-stable.deb


# Set WORKDIR and install dependencies
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files and run tests
COPY . .
RUN npm run test:ci
RUN npm run build
RUN npm run e2e:update-webdriver -- --versions.chrome 2.44
RUN npm run server & npm run sitemap; npm run e2e


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
