const angular = require('../angular.json');

const applications = Object.keys(angular.projects)
   .map((projectKey) => ({ projectKey: projectKey, projectProperties: angular.projects[projectKey] }))
   .filter(({ projectProperties }) => projectProperties.projectType == 'application')
   .map(({ projectKey, projectProperties }) => {
      const options = projectProperties.architect.build.options;
      options.name = projectKey;
      return options;
   });

module.exports.json = angular;
module.exports.applications = applications;
