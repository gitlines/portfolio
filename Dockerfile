### Build stage ###
FROM node:8.10 as builder

# Install Google Chrome for testing
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get -qq update && apt-get -qq install -y google-chrome-stable

# Set WORKDIR and install dependencies
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn --silent

# Copy source files and run tests
COPY . .
RUN npm run ci:test
RUN npm run ci:e2e
RUN npm run build


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
