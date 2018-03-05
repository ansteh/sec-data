const _           = require('lodash');

const MongoClient = require('mongodb').MongoClient;

const config = require('./credentials.json');
// const config = {
//   remote: {
//     host: 'localhost',
//     port: '27017'
//   }
// };

const dbName = 'sec-data';

const ClientRoles = [
  { role: "readWrite", db: "sec-data" }
];

const getSourceUrl = () => {
  const user = encodeURIComponent(config.admin.user);
  const password = encodeURIComponent(config.admin.password);
  return `mongodb://${user}:${password}@${config.remote.host}:${config.remote.port}`;
};

const listDatabases = () => {
  const source = getSourceUrl();

  return MongoClient.connect(source)
    .then((client) => {
      const adminDb = client.db(dbName).admin();

      return new Promise((resolve, reject) => {
        adminDb.listDatabases((err, dbs) => {
          client.close();

          if(err) {
            reject(err);
          } else {
            resolve(dbs.databases);
          }
        });
      });
    })
};

const addUser = ({ user, password, options }) => {
  const source = getSourceUrl();

  return MongoClient.connect(source)
    .then((client) => {
      const adminDb = client.db(dbName).admin();

      return adminDb.addUser(user, password, { roles: ClientRoles });
    })
};

module.exports = {
  listDatabases,
};

// listDatabases()
//   .then(console.log)
//   .catch(console.log);

addUser(config.client)
  .then(console.log)
  .catch(console.log);
