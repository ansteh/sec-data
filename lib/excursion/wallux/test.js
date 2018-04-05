const Crawler = require('./crawler.js');
const Wallux  = require('./index.js');

// Crawler.getCategories('https://wallux.com/accueil/lexique-activite.php?code-entreprise=18')
//   .then(console.log)
//   .catch(console.log)

Wallux.crawlCategories('https://wallux.com/accueil/lexique-activite.php?code-entreprise=18')
  .then(console.log)
  .catch(console.log)
