const _       = require('lodash');
const fs      = require('fs-extra');

const Service = require('./service');
const Filings = require('../filings');
const Filing  = require('../filing');

const Promise = require('bluebird');

const domain = 'https://www.sec.gov';

const createFilingsCrawler = (type, count, infoPath) => {
  type = type || '10-K';
  count = count || 100;
  infoPath = infoPath || 'filings.annual';

  return (ticker, queryParams) => {
    return Service.findStockByTicker(ticker)
      .then((stock) => {
        let params = Object.assign({
          cik: stock.cik,
          type,
          count,
        }, queryParams);

        let searchUrl = Filings.Queries.getCompany(params);

        return Filings.Crawler.crawl(searchUrl)
          .then(html => Filings.Crawler.parseDocument(html))
          .then((filings) => {
            _.set(stock, infoPath, { params, filings });

            return stock;
          })
      })
      .then((stock) => {
        if(stock) return Service.save(stock);
      });
  };
};

const crawlAnnualFilings = createFilingsCrawler();
const crawlQuarterlyFilings = createFilingsCrawler('10-Q', 100, 'filings.quarterly');

const downloadFiles = _.curry((filterFilings, ticker) => {
  return Service.findStockByTicker(ticker)
    .then((stock) => {
      let filings = filterFilings(stock);

      return Promise.all(_.map(filings, (filing) => {
        let filingUrl = `${domain}${filing.resources.files}`;
        let prefix = filing.type.replace('/', '');
        let destination = `stocks/${stock.ticker}/files/${prefix}_${filing.date}.xml`

        return downloadInstanceFile(filingUrl, destination);
      }));
    });
});

const filterInteractiveAnnualFilings = (stock, formType = '10-K') => {
  return _
    .chain(_.get(stock, 'filings.annual.filings.entries'))
    .filter(filing => filing.resources.view)
    .filter(filing => filing.type === formType)
    .value();
};

const filterInteractiveQuarterlyFilings = (stock, formType = '10-Q') => {
  return _
    .chain(_.get(stock, 'filings.quarterly.filings.entries'))
    .filter(filing => filing.resources.view)
    .filter(filing => filing.type === formType)
    .value();
};

const downloadAnnualFiles = downloadFiles(filterInteractiveAnnualFilings);
const downloadQuarterlyFiles = downloadFiles(filterInteractiveQuarterlyFilings);

const downloadInstanceFile = (filingUrl, destination) => {
  return Filing.Crawler.crawlInstanceFilenUrl(filingUrl)
    .then((dataFileUrl) => {
      return Filing.Crawler.downloadFile(dataFileUrl, destination);
    });
};

const parseFilingFilesByTicker = (ticker, prefix = '10-K') => {
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

      files = files.filter((file) => {
        let filename = _.last(file.split('/'));
        return _.includes(filename, prefix);
      });

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

const readFilings = (ticker, formType) => {
  return getFilingFilesByTicker(ticker)
    .then((files) => {
      if(!files) return null;

      if(formType) {
        files = files.filter((file) => {
          let filename = _.last(file.split('/'));
          return _.includes(filename, formType);
        });
      }

      return Promise.all(_.map(files, (file) => {
        return fs.readJson(`${tickerDir}/filings/${file}`);
      }));
    });
};

const find = (ticker, entry, formType = '10-K') => {
  let fillings;

  return readFilings(ticker, formType)
    .then((results) => {
      fillings = results;
      return fillings;
    })
    .then(Filings.Parser.find(entry))
    .then((entries) => {
      entries = _
        .chain(entries)
        .flatten()
        .uniq()
        .value();

      return entries;
    });
};

const findPathsToRefs = (ticker, refs) => {
  return readFilings(ticker, undefined)
    .then((filings) => {
      return _
        .chain(filings)
        .map(filing => traverse(filing, refs))
        .flatten()
        .uniq()
        .value();
    });
};

const traverse = (scope, values, path = '') => {
  let matches = [];

  if(_.isString(scope) || _.isNumber(scope) || _.isBoolean(scope)) {
    return matches;
  }

  if(_.has(scope, 'contextRef')) {
    if(_.includes(values, scope.contextRef)) {
      _.pull(values, scope.contextRef);
      console.log(scope);
      matches.push(`${path}`);
    }
  }

  if(_.isArray(scope)) {
    let results = _.map(scope, (candidate, index) => {
      return traverse(candidate, values, `${path}.${index}`);
    });
    matches = matches.concat(_.flatten(results));
  } else if(_.isPlainObject(scope)) {
    _.forOwn(scope, (candidate, key) => {
      if(key !== 'contextRef' && (_.isPlainObject(candidate) || _.isArray(candidate))) {
        let deepMatches = traverse(candidate, values, `${path}.${key}`);
        matches = matches.concat(deepMatches);
      }
    });
  }

  return matches;
};

const getContext = (ticker) => {
  return readFilings(ticker, undefined)
    .then((filings) => {
      return _.map(filings, 'context');
    });
};

module.exports = {
  crawlAnnualFilings,
  crawlQuarterlyFilings,
  crawlStock,
  create: Service.create,
  downloadAnnualFiles,
  downloadQuarterlyFiles,
  exists,
  find,
  findPathsToRefs,
  findStockByTicker: Service.findStockByTicker,
  getContext,
  parseFilingFilesByTicker,
  remove: Service.remove,
  save: Service.save,
}
