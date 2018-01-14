const _       = require('lodash');
const fs      = require('fs-extra');
const util    = require('../util.js');
const Promise = require('bluebird');

const domain = 'https://www.sec.gov';
const basePath = `${__dirname}/../../resources/stocks`;

const create = (stock) => {
  return ensureDirectories(stock.ticker)
    .then(() => save(stock));
};

const ensureDirectories = (ticker) => {
  const pathname = `${basePath}/${ticker}`;

  return fs.pathExists(pathname)
    .then((exists) => {
      if(exists === false) {
        return fs.ensureDir(pathname)
          .then(() => fs.ensureDir(`${pathname}/filings`))
          .then(() => fs.ensureDir(`${pathname}/files`))
      }
    });
};

const getStockFilepath = (ticker) => {
  return `${basePath}/${ticker}/stock.json`;
};

const save = (stock) => {
  if(!stock.filings) {
    stock.filings = {};
  }

  const filepath = getStockFilepath(stock.ticker);
  return fs.writeJson(filepath, stock);
};

const remove = (stock) => {
  return fs.remove(`${basePath}/${stock.ticker}`);
};

const findByTicker = (ticker) => {
  const filepath = getStockFilepath(ticker);
  return fs.readJson(filepath);
};

const hasEmptyFilings = (ticker) => {
  return util.getFiles(`${basePath}/${ticker}/filings`)
    .then((files) => {
      return files.length === 0;
    })
    .catch((err) => {
      if(err.code === 'ENOENT') {
        return false;
      }
    });
};

const hasUnparsedFilings = (stock) => {
  const ticker = stock.ticker;

  return hasEmptyFilings(ticker)
    .then((empty) => {
      if(empty) {
        const annuals = _
          .chain(_.get(stock, 'filings.annual.filings.entries'))
          .filter(filing => filing.resources.view)
          .value();

        const quarterlies =  _
          .chain(_.get(stock, 'filings.quarterly.filings.entries'))
          .filter(filing => filing.resources.view)
          .value();

        return [...annuals, ...quarterlies].length > 0;
      }

      return empty;
    });
};

const filterDownloadInstructionsByStock = _.curry((stock, filterFilings, formType) => {
  let filings = filterFilings(stock, formType);

  return _.map(filings, (filing) => {
    let filingUrl = `${domain}${filing.resources.files}`;
    let prefix = filing.type.replace('/', '');
    let destination = `stocks/${stock.ticker}/files/${prefix}_${filing.date}.xml`

    return { filingUrl, destination };
  });
});

const filterDownloadInstructions = _.curry((filterFilings, ticker, formType) => {
  return findByTicker(ticker)
    .then((stock) => {
      return filterDownloadInstructionsByStock(stock, filterFilings, formType);
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

const getUndownloadedFilings = (ticker) => {
  return Promise.all([
    util.getFiles(`${basePath}/${ticker}/files`),
    findByTicker(ticker),
  ]).then(([files, stock]) => {
    if(!stock) {
      console.log(`${ticker} does not exists!`);
      return;
    }

    const forms = stock.forms;

    const annual = filterDownloadInstructionsByStock(
      stock,
      filterInteractiveAnnualFilings,
      forms.annual
    );

    const quarterly = filterDownloadInstructionsByStock(
      stock,
      filterInteractiveQuarterlyFilings,
      forms.quarterly
    );

    const filesPath = `stocks/${ticker}/files/`;
    const filePaths = _.map(files, file => `${filesPath}${file}`);
    // console.log(filePaths);

    return _
      .chain([...annual, ...quarterly])
      .filter(({ destination }) => {
        return _.includes(filePaths, destination) === false;
      })
      .value();
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

const getFilingFilesByTicker = (ticker) => {
  return findByTicker(ticker)
    .then((stock) => {
      if(stock) {
        tickerDir = `${__dirname}/../../resources/stocks/${stock.ticker}`;

        return util.getFiles(`${tickerDir}/filings`);
      }
    });
};

const getFilingTransmissionsBy = (ticker, prefix = '10-K') => {
  let tickerDir;

  return findByTicker(ticker)
    .then((stock) => {
      if(stock) {
        tickerDir = `${__dirname}/../../resources/stocks/${stock.ticker}`;

        return util.getFiles(`${tickerDir}/files`);
      }
    })
    .then((files) => {
      if(!files) return null;

      files = files.filter((file) => {
        let filename = _.last(file.split('/'));
        return _.includes(filename, prefix);
      });

      return _.map(files, (file) => {
        return {
          src: `${tickerDir}/files/${file}`,
          dest: `${tickerDir}/filings/${_.replace(file, '.xml', '.json')}`
        };
      });
    });
};

const getSummaryFilepath = (ticker) => {
  return `${basePath}/${ticker}/summary.json`;
};

const saveSummary = (ticker, content = {}) => {
  const filepath = getSummaryFilepath(ticker);

  return fs.pathExists(filepath)
    .then((exists) => {
      if(exists === false) {
        return fs.writeJson(filepath, {});
      }
    })
    .then(() => {
      return fs.readJson(filepath);
    })
    .then((summary) => {
      return fs.writeJson(filepath, _.merge(summary, content));
    });
};

const removeSummary = (ticker) => {
  const filepath = getSummaryFilepath(ticker);

  return fs.remove(filepath);
}

const getTickersFromResources = () => {
  return util.getFiles(basePath);
};

const getStocksFromResources = () => {
  return getTickersFromResources()
    .then((tickers) => {
      return Promise.all(tickers.map(findByTicker));
    })
    .then((stocks) => {
      return _.keyBy(stocks, 'ticker');
    });
};

const getSummary = (tickers) => {
  if(_.isString(tickers)) {
    tickers = [tickers];
  }

  const summaries = tickers.map((ticker) => {
    const filepath = getSummaryFilepath(ticker);

    return fs.readJson(filepath)
      .then((content) => {
        content.ticker = ticker;
        return content;
      });
  });

  return Promise.all(summaries)
    .then((summaries) => {
      return _.keyBy(summaries, 'ticker');
    });
};

const getFormsByTicker = (ticker) => {
  return findByTicker(ticker)
    .then((stock) => {
      return {
        annual: _.get(stock, 'forms.annual', '10-K'),
        quarterly: _.get(stock, 'forms.quarterly', '10-Q')
      };
    });
};

const getAnnualFilings = (ticker) => {
  return getFormsByTicker(ticker)
    .then(({ annual }) => {
      return readFilings(ticker, annual);
    });
};

const getQuarterlyFilings = (ticker) => {
  return getFormsByTicker(ticker)
    .then(({ quarterly }) => {
      return readFilings(ticker, quarterly);
    });
};

module.exports = {
  create,
  filterDownloadInstructions,
  filterInteractiveAnnualFilings,
  filterInteractiveQuarterlyFilings,
  findByTicker,
  getFilingTransmissionsBy,
  getFormsByTicker,
  getAnnualFilings,
  getQuarterlyFilings,
  getTickersFromResources,
  getStocksFromResources,
  getSummaryFilepath,
  getUndownloadedFilings,
  hasEmptyFilings,
  hasUnparsedFilings,
  readFilings,
  remove,
  getSummary,
  save,
  saveSummary,
  removeSummary,
};
