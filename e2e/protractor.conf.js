// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

exports.config = {
   allScriptsTimeout: 11000,
   specs: ['./features/*.feature'],
   capabilities: {
      browserName: 'chrome',
      chromeOptions: {
         args: [
            '--headless', // Use headless mode
            '--no-sandbox',
            '--disable-gpu',
            '--window-size=414,736', // Size of an iPhone 6 Plus
         ],
      },

      // Metadata for Cucumber report
      metadata: {
         browser: {
            name: 'chrome',
         },
         device: 'Virtual Machine',
         platform: {
            name: 'ubuntu',
            version: '14.04',
         },
      },
   },

   directConnect: true,
   baseUrl: 'http://localhost:5000/',

   framework: 'custom',
   frameworkPath: require.resolve('protractor-cucumber-framework'),

   cucumberOpts: {
      require: ['./steps/**/*.ts'],
      tags: [], // Only execute the features or scenarios with tags matching the expression
      format: ['node_modules/cucumber-pretty', 'json:docs/cucumber/results.json'],
      strict: true,
      dryRun: false,
      compiler: [],
   },

   plugins: [
      {
         package: 'protractor-multiple-cucumber-html-reporter-plugin',
         options: {
            automaticallyGenerateReport: true,
            disableLog: true,
            displayDuration: true,
            pageTitle: 'Portfolio features',
            removeOriginalJsonReportFile: true,
            removeExistingJsonReportFile: true,
            reportPath: 'docs/cucumber',
            saveCollectedJSON: true,
         },
      },
   ],

   onPrepare() {
      require('ts-node').register({
         project: 'e2e/tsconfig.e2e.json',
      });
   },
};
