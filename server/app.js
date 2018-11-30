'use strict';
const express        = require('express');
const app            = express();

const bodyParser     = require('body-parser');
const cors           = require('cors');

const path           = require('path');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const apiUrl = '/api';
app.use(apiUrl, require('./api/stocks'));
app.use(apiUrl, require('./api/stock'));
app.use(apiUrl, require('./api/portfolio/audit'));

const server = require('http').Server(app);

server.listen(4201, () => {
  console.log('listening on *:4201');
});
