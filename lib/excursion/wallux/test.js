const Crawler = require('./crawler.js');
const Wallux  = require('./index.js');

// Crawler.getCategories('https://wallux.com/accueil/lexique-activite.php?code-entreprise=18')
//   .then(console.log)
//   .catch(console.log)

// Wallux.crawlCategories('https://wallux.com/accueil/lexique-activite.php?code-entreprise=18')
//   .then(console.log)
//   .catch(console.log)

// Crawler.getListing('https://wallux.com/accueil/lexique-acteur-economique.php?code-entreprise=18&ac=10&name-activite=Institut%20de%20beaut%C3%A9')
//   .then(content => JSON.stringify(content, null, 2))
//   .then(console.log)
//   .catch(console.log)

// Wallux.crawlListings()
//   .then(() => console.log('Finished with listings!'))
//   .catch(console.log)

// Crawler.getContact('http://wallux.com/act/institut-de-beaute-secret-des-sens-arlon/contact-horaires')
//   .then(content => JSON.stringify(content, null, 2))
//   .then(console.log)
//   .catch(console.log)

Wallux.crawlContacts()
  .then(() => console.log('Finished with contacts!'))
  .catch(console.log)
