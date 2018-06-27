const Promise = require('bluebird');
const github = require('octonode');

// Env variables
const TRAVIS = process.env.TRAVIS;
const GH_TOKEN = process.env.GH_TOKEN;
const SLUG = process.env.TRAVIS_PULL_REQUEST_SLUG;
const PR = process.env.TRAVIS_PULL_REQUEST;

// Connect to GitHub API
const connectGithub = () => {
  if (GH_TOKEN) {
    return Promise.resolve(github.client(GH_TOKEN));
  } else {
    return Promise.reject(new Error('Missing required environment variable GH_TOKEN'));
  }
};

// Create or update a comment
const updateComment = (title, body) => {

  let githubClient;

  return connectGithub()
    .then((client) => {
      githubClient = client;
      console.log(JSON.stringify(process.env));
    });
};

module.exports.updateComment = updateComment;
