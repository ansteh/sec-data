const Service = require('./service');
const Filings = require('../filings');

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
          stock.search = stock.search || {};
          stock.search.annual = {
            params,
            filings,
          };

          return stock;
        })
    })
    .then((stock) => {
      if(stock) return Service.save(stock);
    });
};

const downloadAnnualFiles = (ticker) => {

};

module.exports = {
  crawlAnnualFilings,
  create: Service.create,
  findStockByTicker: Service.findStockByTicker,
  remove: Service.remove,
  save: Service.save,
}
