'use strict';
const express        = require('express');
const app            = express();

const bodyParser     = require('body-parser');
const cors           = require('cors');

const path           = require('path');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', express.static(path.join(__dirname, '../dist')));

['stocks', 'stock/*', 'stock-market/*'].map((endpoint) => {
  app.all(`/${endpoint}`, (req, res, next) => {
    res.sendFile('index.html', { root: path.join(__dirname, '../dist') });
  });
});

const server = require('http').Server(app);

server.listen(4202, () => {
  console.log('listening on *:4202');
});
