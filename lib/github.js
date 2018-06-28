const Promise = require('bluebird');
const github = require('octonode');
const chalk = require('chalk');

// Env variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const TYPE = process.env.TRAVIS_EVENT_TYPE;
const REPO = process.env.TRAVIS_REPO_SLUG;
const PR = process.env.TRAVIS_PULL_REQUEST;
const BRANCH = process.env.TRAVIS_BRANCH;
const COMMIT = process.env.TRAVIS_COMMIT;

// Connect to GitHub API
const connectGithub = () => {
  if (GITHUB_TOKEN) {
    return Promise.resolve(github.client(GITHUB_TOKEN));
  } else {
    return Promise.reject(new Error('Missing required environment variable GITHUB_TOKEN'));
  }
};

// Fins GitHub's related issue for the deploy given the env vars
const findIssue = (client) => {

  switch (TYPE) {

    case 'pr': // For Pull Requests we can access the issue directly

      return Promise.resolve(client.issue(REPO, PR));

    case 'push': // For Push we search for the commit and branch

      return client.search().issuesAsync({
          q: `type:pr repo:${REPO} SHA:${COMMIT} head:${BRANCH}`
        })
        .then(([results]) => {
          if (results.items && results.items.length) {
            return results.items[0];
          } else {
            return Promise.reject(new Error('No PR found for this push event.'));
          }
        })
        .then((issue) => client.issue(REPO, issue.number));

    default: // Otherwise, exit
      return Promise.reject(new Error('Unknown deploy event type.'));
  }
};

// Create or update a comment
const comment = (title, body) => {

  return connectGithub()
    .then((client) => findIssue(client))
    .then((issue) => [issue, issue.commentsAsync()]) // List all comments
    .spread((issue, [comments]) => Promise.all(
        comments
        .filter((comment) => comment.body.substr(2, title.length) === title)
        .map((comment) => issue.deleteCommentAsync(comment.id)) // Delete previous comments
      )
      .then(() => issue)
    )
    .then((issue) => issue.createCommentAsync({ // Post the comment
      body: `# ${title}\n${body}`
    }))
    .then(([comment]) => console.log(chalk.green(`New comment with title "${title}" posted at PR ${comment.html_url}`)));

};

module.exports.comment = comment;
