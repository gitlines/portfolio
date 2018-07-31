const download = require('./download');

const generateBadge = ({ subject, status, color, file }) => {
   const url = `https://img.shields.io/badge/${encodeURI(subject)}-${encodeURI(status)}-${color}.svg`;
   return download(url, file);
};

const generateScoreBadge = ({ subject, score, file }) => {
   score = parseInt(score);
   let color = 'red';

   if (score >= 100) {
      color = 'brightgreen';
   } else if (score > 90) {
      color = 'green';
   } else if (score > 80) {
      color = 'yellowgreen';
   } else if (score > 70) {
      color = 'yellow';
   } else if (score > 60) {
      color = 'orange';
   }

   return generateBadge({ subject: subject, status: `${score}%`, color: color, file: file });
};

module.exports.generateBadge = generateBadge;
module.exports.generateScoreBadge = generateScoreBadge;
