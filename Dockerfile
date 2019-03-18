### Build stage ###
FROM node:8.14.0 as builder

LABEL authors="Samuel Fernandez"

# Install Google Chrome for testing
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get -qq update \
   && apt-get -qq install google-chrome-stable unzip dbus-x11 xvfb xauth libgtk2.0-0 libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 -y --no-install-recommends \
   && apt-get -qq clean \
   && rm -rf /var/lib/apt/lists/*

# Install Cypress
WORKDIR /opt/cypress
RUN wget https://download.cypress.io/desktop/3.1.5?platform=linux -O cypress.zip -q && unzip -qq cypress.zip -d ./3.1.5 && rm cypress.zip
ENV CYPRESS_INSTALL_BINARY="0" CYPRESS_RUN_BINARY="/opt/cypress/3.1.5/Cypress/Cypress"

# Configure environment
ENV TERM xterm
ENV npm_config_loglevel error

# Set WORKDIR and install dependencies
WORKDIR /usr/src/app
COPY package.json package-lock.json .env* ./
RUN npm ci

# Copy source files and run tests
COPY . .

# Set node in production mode
ENV NODE_ENV=production

RUN npm run test:ci
RUN npm run build
RUN npm run server & npm run sitemap; xvfb-run -a npm run e2e:ci


### Server stage ###
FROM node:8.14.0-alpine as server

# Set node in production mode and some configurations
ENV NODE_ENV=production
ENV TERM xterm
ENV npm_config_loglevel error

# Install dumb-init to handle termination signals
ADD https://github.com/Yelp/dumb-init/releases/download/v1.1.1/dumb-init_1.1.1_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

# Set WORKDIR and copy compiled files and .env
WORKDIR /usr/src/app
COPY package.json package-lock.json .env* ./
COPY --from=builder /usr/src/app/dist ./
RUN npm ci --only=production

# Run as a non-root user
USER node

# Launch the server
CMD ["dumb-init", "node", "server.js"]
