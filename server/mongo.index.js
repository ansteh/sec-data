const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'sec-data';

MongoClient.connect(url)
  .then((client) => {
    // assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    client.close();
  })
  .catch((err) => {
    console.log(err);
  });
