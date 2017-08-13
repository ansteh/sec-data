const _       = require('lodash');

const Service = require('./service');
const Filings = require('../filings');
const Filing  = require('../filing');

const Promise = require('bluebird');

const domain = 'https://www.sec.gov';

const crawlAnnualFilings = (ticker, queryParams) => {
  return Service.findStockByTicker(ticker)
    .then((stock) => {
      let params = Object.assign({
        cik: stock.cik,
        type: '10-K',
        count: 40,
      }, queryParams);

      let searchUrl = Filings.Queries.getCompany(params);

      return Filings.Crawler.crawl(searchUrl)
        .then(html => Filings.Crawler.parseDocument(html))
        .then((filings) => {
          _.set(stock, 'filings.annual', { params, filings });

          return stock;
        })
    })
    .then((stock) => {
      if(stock) return Service.save(stock);
    });
};

const downloadAnnualFiles = (ticker) => {
  return Service.findStockByTicker(ticker)
    .then((stock) => {
      let filings = filterInteractiveAnnualFilings(stock);

      return Promise.all(_.map(filings, (filing) => {
        let filingUrl = `${domain}${filing.resources.files}`;
        let destination = `stocks/${stock.ticker}/files/${filing.type}_${filing.date}.xml`

        return downloadInstanceFile(filingUrl, destination);
      }));
    });
};

const filterInteractiveAnnualFilings = (stock) => {
  return _
    .chain(_.get(stock, 'filings.annual.filings.entries'))
    .filter(filing => filing.resources.view)
    .value();
};

const downloadInstanceFile = (filingUrl, destination) => {
  return Filing.Crawler.crawlInstanceFilenUrl(filingUrl)
    .then((dataFileUrl) => {
      return Filing.Crawler.downloadFile(dataFileUrl, destination);
    });
};

module.exports = {
  crawlAnnualFilings,
  create: Service.create,
  downloadAnnualFiles,
  findStockByTicker: Service.findStockByTicker,
  remove: Service.remove,
  save: Service.save,
}
