const express        = require('express');
const router         = express.Router();

const _              = require('lodash');
const Audit          = require('./model');

router.get('/portfolio/audit', (req, res) => {
  console.log('req.query.view', req.query.view);
  Audit.getValuation(req.query.view)
    .then((valuation) => {
      res.status(200).json(valuation);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

module.exports = router;
