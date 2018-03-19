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

const server = require('http').Server(app);

server.listen(4200, () => {
  console.log('listening on *:4200');
});
