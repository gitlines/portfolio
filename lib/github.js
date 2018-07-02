const Promise = require('bluebird');
const github = require('octonode');
const chalk = require('chalk');

// Env variables
const {
   GH_TOKEN,
   TRAVIS_EVENT_TYPE,
   TRAVIS_REPO_SLUG,
   TRAVIS_PULL_REQUEST,
   TRAVIS_BRANCH,
   TRAVIS_COMMIT
} = process.env;

// Connect to GitHub API
const connectGithub = () => {
   if (GH_TOKEN) {
      return Promise.resolve(github.client(GH_TOKEN));
   }
   return Promise.reject(new Error('Missing required environment variable GH_TOKEN'));
};

// Fins GitHub's related issue for the deploy given the env vars
const findIssue = client => {
   switch (TRAVIS_EVENT_TYPE) {
      case 'pr': // For Pull Requests we can access the issue directly
         return Promise.resolve(client.issue(TRAVIS_REPO_SLUG, TRAVIS_PULL_REQUEST));

      case 'push': // For Push we search for the commit and branch
         return client
            .search()
            .issuesAsync({
               q: `type:pr repo:${TRAVIS_REPO_SLUG} SHA:${TRAVIS_COMMIT} head:${TRAVIS_BRANCH}`
            })
            .then(([results]) => {
               if (results.items && results.items.length > 0) {
                  return results.items[0];
               }
               return Promise.reject(new Error('No PR found for this push event.'));
            })
            .then(issue => client.issue(TRAVIS_REPO_SLUG, issue.number));

      default:
         // Otherwise, exit
         return Promise.reject(new Error('Unknown deploy event type.'));
   }
};

// Create or update a comment
const comment = (title, body) => {
   return connectGithub()
      .then(client => findIssue(client))
      .then(issue => [issue, issue.commentsAsync()]) // List all comments
      .spread((issue, [comments]) =>
         Promise.all(
            comments
               .filter(comment => comment.body.substr(2, title.length) === title)
               .map(comment => issue.deleteCommentAsync(comment.id)) // Delete previous comments
         ).then(() => issue)
      )
      .then(issue =>
         issue.createCommentAsync({
            // Post the comment
            body: `# ${title}\n${body}`
         })
      )
      .then(([comment]) =>
         console.log(chalk.green(`New comment with title "${title}" posted at PR ${comment.html_url}`))
      );
};

module.exports.comment = comment;
