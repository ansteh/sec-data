const MongoClient = require('mongodb').MongoClient;
const test = require('assert');
// Connection url
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'sec-data';
// Connect using MongoClient

return MongoClient.connect(url)
  .then((client) => {
    const adminDb = client.db(dbName).admin();

    return adminDb.listDatabases((err, dbs) => {
      console.log(dbs.databases);
      test.ok(dbs.databases.length > 0);
      client.close();
    });
  })
  .catch(console.log)
