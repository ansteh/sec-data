const _       = require('lodash');
const fs      = require('fs-extra');

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

const parseFilingFilesByTicker = (ticker) => {
  let tickerDir;

  return Service.findStockByTicker(ticker)
    .then((stock) => {
      if(stock) {
        tickerDir = `${__dirname}/../../resources/stocks/${stock.ticker}`;

        return getFilesOfDirectory(`${tickerDir}/files`);
      }
    })
    .then((files) => {
      if(!files) return null;

      return Promise.all(_.map(files, (file) => {
        let src = `${tickerDir}/files/${file}`;
        let dest = `${tickerDir}/filings/${_.replace(file, '.xml', '.json')}`;

        return parseAndSaveFilingBy(src, dest);
      }));
    });
};

const getFilesOfDirectory = (dirPath) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, items) => {
      if(err) {
        reject(err);
      } else {
        resolve(items);
      }
    });
  });
};

const parseAndSaveFilingBy = (src, dest) => {
  return Filing.Parser.parse(src)
    .then((filing) => {
      return fs.writeJson(dest, filing);
    })
    .then(() => {
      return true;
    });
};

const exists = (ticker) => {
  return fs.existsSync(`${__dirname}/../../resources/stocks/${ticker}`);
};

const crawlStock = (stock) => {
  return new Promise((resolve, reject) => {
      if(!stock.ticker) {
        reject('no ticker available');
      } else {
        resolve(true);
      }
    })
    .then(() => {
      if(exists(stock.ticker)) {
        throw new Error(`${stock.ticker} already exists!`);
      }
    })
    .then(() => Service.create(stock))
    .then(() => crawlAnnualFilings(stock.ticker))
    .then(() => downloadAnnualFiles(stock.ticker))
    .then(() => parseFilingFilesByTicker(stock.ticker));
};

const getFilingFilesByTicker = (ticker) => {
  return Service.findStockByTicker(ticker)
    .then((stock) => {
      if(stock) {
        tickerDir = `${__dirname}/../../resources/stocks/${stock.ticker}`;

        return getFilesOfDirectory(`${tickerDir}/filings`);
      }
    });
};

const readFilings = (ticker) => {
  return getFilingFilesByTicker(ticker)
    .then((files) => {
      if(!files) return null;

      return Promise.all(_.map(files, (file) => {
        return fs.readJson(`${tickerDir}/filings/${file}`);
      }));
    });
};

const findDividends = (filing) => {
  return filing['us-gaap:CommonStockDividendsPerShareDeclared'];
};

const getDividends = (ticker) => {
  return readFilings(ticker)
    .then((filings) => {
      return _
        .chain(filings)
        .map(findDividends)
        .filter(dividends => dividends)
        .flatten()
        .uniqBy(dividend => dividend.contextRef)
        .map(({ contextRef, $t }) => {
          return { contextRef, value: $t };
        })
        .value();
    });
};

module.exports = {
  crawlAnnualFilings,
  crawlStock,
  create: Service.create,
  downloadAnnualFiles,
  getDividends,
  exists,
  findStockByTicker: Service.findStockByTicker,
  parseFilingFilesByTicker,
  remove: Service.remove,
  save: Service.save,
}
