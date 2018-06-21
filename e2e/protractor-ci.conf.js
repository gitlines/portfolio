const config = require('./protractor.conf').config;

config.capabilities = {
  browserName: 'chrome',
  chromeOptions: {
    args: [
      '--headless',
      '--disable-gpu',
      '--window-size=414,736' // Size of an iPhone 6 Plus
    ]
  }
};

exports.config = config;
