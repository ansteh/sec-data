const _       = require('lodash');
const fs      = require('fs-extra');

const Service = require('./service');
const Filings = require('../filings');
const Filing  = require('../filing');
const util    = require('../util.js');

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

const downloadFiles = _.curry((filterFilings, ticker, formType) => {
  return Service.findStockByTicker(ticker)
    .then((stock) => {
      let filings = filterFilings(stock, formType);

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
  const forms = {
    annual: _.get(stock, 'forms.annual', '10-K'),
    quarterly: _.get(stock, 'forms.quarterly', '10-Q')
  };

  return new Promise((resolve, reject) => {
      if(!stock.ticker) {
        reject('no ticker available');
      } else {
        resolve(true);
      }
    })
    .then(() => {
      if(exists(stock.ticker)) {
        console.log(`${stock.ticker} already exists!`);
      } else {
        return Service.create(stock)
          .then(() => {
            if(forms.annual) {
              return crawlAndDownloadAnnuals(stock.ticker, forms.annual)
            }
          })
          .then(() => {
            if(forms.quarterly) {
              return crawlAndDownloadQuarterls(stock.ticker, forms.quarterly)
            }
          });
      }
    });
};

const crawlAndDownload = (ticker) => {
  let stock, forms;

  return Service.findStockByTicker(ticker)
    .then((instance) => {
      stock = instance;
      forms = {
        annual: _.get(stock, 'forms.annual', '10-K'),
        quarterly: _.get(stock, 'forms.quarterly', '10-Q')
      };
    })
    .then(() => {
      if(forms.annual) {
        return crawlAndDownloadAnnuals(stock.ticker, forms.annual)
      }
    })
    .then(() => {
      if(forms.quarterly) {
        return crawlAndDownloadQuarterls(stock.ticker, forms.quarterly)
      }
    });
};

const parseForms = (ticker) => {
  let stock, forms;

  return Service.findStockByTicker(ticker)
    .then((instance) => {
      stock = instance;
      forms = {
        annual: _.get(stock, 'forms.annual', '10-K'),
        quarterly: _.get(stock, 'forms.quarterly', '10-Q')
      };
    })
    .then(() => {
      if(forms.annual) {
        return parseFilingFilesByTicker(stock.ticker, forms.annual)
      }
    })
    .then(() => {
      if(forms.quarterly) {
        return parseFilingFilesByTicker(stock.ticker, forms.quarterly)
      }
    });
};

const crawlAndDownloadAnnuals = (ticker, formType) => {
  return crawlQuarterlyFilings(ticker, {
      type: formType
    })
    .then(() => downloadQuarterlyFiles(ticker, formType))
    .then(() => parseFilingFilesByTicker(ticker, formType));
};

const crawlAndDownloadQuarterls = (ticker, formType) => {
  return crawlAnnualFilings(ticker, {
      type: formType
    })
    .then(() => downloadAnnualFiles(ticker, formType))
    .then(() => parseFilingFilesByTicker(ticker, formType));
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

const crawlStocks = (seedFile) => {
  return util.loadFileContent(`${__dirname}/../../resources/issues/${seedFile}`)
    .then((content) => {
      const stocks = JSON.parse(content)
        .stocks
        .filter((seed) => {
          return _.has(seed, 'sec.forms.annual');
        })
        .map((seed) => {
          return crawlStock(seed.sec);
        });

      return Promise.all(stocks);
    });
};

module.exports = {
  crawlAnnualFilings,
  crawlQuarterlyFilings,
  crawlAndDownload,
  crawlStock,
  crawlStocks,
  create: Service.create,
  downloadAnnualFiles,
  downloadQuarterlyFiles,
  exists,
  find,
  findStockByTicker: Service.findStockByTicker,
  hasEmptyFilings: Service.hasEmptyFilings,
  parseFilingFilesByTicker,
  parseForms,
  remove: Service.remove,
  save: Service.save,
}
