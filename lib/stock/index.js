const _       = require('lodash');
const fs      = require('fs-extra');

const Service = require('./service');
const Filings = require('../filings');
const Filing  = require('../filing');
const util    = require('../util.js');

const PeriodReducer = require('./reducers/period.reducer');
const Promise = require('bluebird');

const crawlFilingsByStock = (stock, form = 'forms.annual', count = 100) => {
  const type = _.get(stock, form, '10-K');
  const infoPath = form === 'forms.annual' ? 'filings.annual' : 'filings.quarterly';

  let params = Object.assign({
    cik: stock.cik,
    type,
    count,
  });

  let searchUrl = Filings.Queries.getCompany(params);

  return Filings.Crawler.crawl(searchUrl)
    .then(html => Filings.Crawler.parseDocument(html))
    .then((filings) => {
      _.set(stock, infoPath, { params, filings });
      return stock;
    });
};

const createFilingsCrawlerByQueryParams = (type, count) => {
  type = type || '10-K';
  count = count || 100;

  return (ticker, queryParams) => {
    return Service.findByTicker(ticker)
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
            return { stock, params, filings };
          })
      });
  };
};

const crawlAnnualFilingsByQueryParams = createFilingsCrawlerByQueryParams();
const crawlQuarterlyFilingsByQueryParams = createFilingsCrawlerByQueryParams(
  '10-Q', 100, 'filings.quarterly'
);

const createFilingsCrawler = (type, count, infoPath) => {
  infoPath = infoPath || 'filings.annual';

  const crawl = createFilingsCrawlerByQueryParams(type, count);

  return (ticker, queryParams) => {
    return crawl(ticker, queryParams)
      .then(({ stock, params, filings }) => {
        _.set(stock, infoPath, { params, filings });
        return stock;
      });
  };
};

const crawlAnnualFilings = createFilingsCrawler();
const crawlQuarterlyFilings = createFilingsCrawler('10-Q', 100, 'filings.quarterly');

const createMissingFilingEntriesCrawler = (type, count, infoPath) => {
  infoPath = infoPath || 'filings.annual';
  const entriesPath = `${infoPath}.filings.entries`;

  const crawl = createFilingsCrawlerByQueryParams(type, count);

  return (ticker, queryParams) => {
    return crawl(ticker, queryParams)
      .then(({ stock, params, filings }) => {
        const crawledEntries = _.get(filings, 'entries');
        const currentEntries = _.get(stock, entriesPath);

        if(_.isEmpty(currentEntries)) {
          _.set(stock, entriesPath, crawledEntries);
          return { stock, missingEntries: crawledEntries };
        }

        const lastEntry = _.first(currentEntries);
        let missingEntries;

        const index = _.findIndex(crawledEntries, (entry) => {
          return entry.date === lastEntry.date &&
                 entry.fileNumber === lastEntry.fileNumber;
        });

        if(index > 0) {
          missingEntries = _.slice(crawledEntries, 0, index);
          const entries = _.concat(missingEntries, currentEntries);

          _.set(stock, entriesPath, entries);
        }

        return { stock, missingEntries };
      });
  };
};

const crawlMissingAnnualFilings = createMissingFilingEntriesCrawler();
const crawlMissingQuarterlyFilings = createMissingFilingEntriesCrawler(
  '10-Q', 100, 'filings.quarterly'
);

const updateFilings = (type, count, infoPath) => {
  const crawl = createMissingFilingEntriesCrawler(type, count, infoPath);

  return (ticker, queryParams) => {
    return crawl(ticker, queryParams)
      .then(({ stock, missingEntries }) => {
        if(missingEntries && missingEntries.length > 0) {
          return Service.save(stock);
        }
      });
  };
};

const updateAnnualFilings = updateFilings();
const updateQuarterlyFilings = updateFilings(
  '10-Q', 100, 'filings.quarterly'
);

const downloadFilesByInstructions = (instructions) => {
  return Promise.all(_.map(instructions, ({ filingUrl, destination }) => {
    return downloadInstanceFile(filingUrl, destination);
  }));
};

const downloadFiles = _.curry((filterFilings, ticker, formType) => {
  return Service.filterDownloadInstructions(filterFilings, ticker, formType)
    .then(downloadFilesByInstructions);
});

const downloadAnnualFiles = downloadFiles(Service.filterInteractiveAnnualFilings);
const downloadQuarterlyFiles = downloadFiles(Service.filterInteractiveQuarterlyFilings);

const downloadMissingInteractiveFilingsBy = (ticker) => {
  return Service.getUndownloadedFilings(ticker)
    .then((instructions) => {
      if(instructions && instructions.length > 0) {
        console.log(`dowload ${instructions.length} missing files.`);
        return downloadFilesByInstructions(instructions);
      }
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
        // .filter((seed) => {
        //   const ticker = _.get(seed, 'sec.ticker');
        //   return _.includes(['GME', 'BBBY'], ticker);
        // })
        .map((seed) => {
          return crawlStock(seed.sec);
        });

      return Promise.all(stocks);
    });
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
        console.log(`${stock.ticker} already exists!`);
      } else {
        return Service.create(stock)
          .then(() => {
            return crawlAndDownload(stock.ticker);
          })
      }
    });
};

const exists = (ticker) => {
  return fs.existsSync(`${__dirname}/../../resources/stocks/${ticker}`);
};

const crawlAndDownload = (ticker) => {
  let stock, forms;

  return Service.findByTicker(ticker)
    .then((instance) => {
      stock = instance;
      forms = {
        annual: _.get(stock, 'forms.annual', '10-K'),
        quarterly: _.get(stock, 'forms.quarterly', '10-Q')
      };
    })
    .then(() => {
      if(forms.annual && _.has(stock, 'filings.annual.filings.entries') === false) {
        return crawlAndDownloadAnnuals(stock.ticker, forms.annual)
      }
    })
    .then(() => {
      if(forms.quarterly && _.has(stock, 'filings.quarterly.filings.entries') === false) {
        return crawlAndDownloadQuarterls(stock.ticker, forms.quarterly)
      }
    });
};

const crawlAndDownloadAnnuals = (ticker, formType) => {
  return crawlAnnualFilings(ticker, { type: formType })
    .then((stock) => {
      if(stock) return Service.save(stock);
    })
    .then(() => downloadAnnualFiles(ticker, formType));
};

const crawlAndDownloadQuarterls = (ticker, formType) => {
  return crawlQuarterlyFilings(ticker, { type: formType })
    .then((stock) => {
      if(stock) return Service.save(stock);
    })
    .then(() => downloadQuarterlyFiles(ticker, formType));
};

const parseFilingFilesByTicker = (ticker, prefix) => {
  let tickerDir;

  return Service.getFilingTransmissionsBy(ticker, prefix)
    .then((files) => {
      return Promise.all(_.map(files, ({ src, dest }) => {
        return parseAndSaveFilingBy(src, dest);
      }));
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

const parseFilings = (ticker) => {
  let stock, forms;

  return Service.findByTicker(ticker)
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

const parseOnlyUnparsedFilings = (ticker) => {
  let stock, forms;

  return Service.findByTicker(ticker)
    .then((instance) => {
      stock = instance;
      forms = {
        annual: _.get(stock, 'forms.annual', '10-K'),
        quarterly: _.get(stock, 'forms.quarterly', '10-Q')
      };
    })
    .then(() => {
      if(forms.annual) {
        return parseOnlyUnparsedFilingFilesByTicker(stock.ticker, forms.annual)
      }
    })
    .then(() => {
      if(forms.quarterly) {
        return parseOnlyUnparsedFilingFilesByTicker(stock.ticker, forms.quarterly)
      }
    });
};

const parseOnlyUnparsedFilingFilesByTicker = (ticker, prefix) => {
  let tickerDir;

  return Service.getOnlyUnparsedFilingTransmissionsBy(ticker, prefix)
    .then((files) => {
      return Promise.all(_.map(files, ({ src, dest }) => {
        return parseAndSaveFilingBy(src, dest);
      }));
    });
};

const find = (ticker, entry, formType) => {
  let fillings;

  return getFormType(ticker, formType)
    .then((formType) => {
      // console.log(formType);
      return Service.readFilings(ticker, formType);
    })
    // .then((results) => {
    //   fillings = results;
    //   return fillings;
    // })
    .then(Filings.Parser.find(entry))
    .then((entries) => {
      return entries = _
        .chain(entries)
        .flatten()
        .uniq()
        .value();
    });
};

const getFormType = (ticker, formType) => {
  if(formType) {
    return Promise.resolve(formType);
  } else {
    return Service.findByTicker(ticker)
      .then((stock) => {
        return _.get(stock, 'forms.annual', '10-K');
      });
  }
}

const downloadInstanceFile = (filingUrl, destination) => {
  return Filing.Crawler.crawlInstanceFilenUrl(filingUrl)
    .then((dataFileUrl) => {
      return Filing.Crawler.downloadFile(dataFileUrl, destination);
    });
};

const getFormTypes = (stock) => {
  return _
    .chain(['forms.annual', 'forms.quarterly'])
    .map(formPath => _.get(stock, formPath))
    .filter(formType => formType)
    .value();
};

const getAllFilingsByFormTypes = (ticker, formTypes) => {
  const filings = formTypes.map((formType) => {
    return Service.readFilings(ticker, formType);
  });

  return Promise.all(filings);
};

const getMetrics = (ticker, entry, filter, batches) => {
  return getFilingBatches(ticker)
    .then((batches) => {
      const filings = _.flatten(batches);
      return filterFilings(filings, filter, entry);
    });
};

const getFilingBatches = (ticker) => {
  return Service.findByTicker(ticker)
    .then(getFormTypes)
    .then(formTypes => getAllFilingsByFormTypes(ticker, formTypes));
};

const getAllFilings = (ticker) => {
  return getFilingBatches(ticker)
    .then((batches) => {
      return _.flatten(batches);
    });
};

const filterFilings = _.curry((filings, filter, property) => {
  let entries = _.flatten(Filings.Parser.find(property, filings))

  entries = _
    .chain(filter(entries))
    .uniq()
    .value();

  return PeriodReducer.toTimeseries(entries);
});

const findStockWithUnparsedFilings = () => {
  return Service.getStocksFromResources()
    .then(stocks => _.values(stocks))
    .then(Service.filterOutRecentlyParsedStocks)
    .then(findStockWithUnparsedFilingsByStocks);
};

const findStockWithUnparsedFilingsByStocks = (stocks) => {
  if(_.isEmpty(stocks)) {
    return null;
  } else {
    const stock = _.first(stocks);

    return Service.hasUnparsedFilings(stock)
      .then((unparsed) => {

        // TODO: fix infinite loops
        const infiniteLoops = ['ADM', 'BBY', 'CBK', 'REGX', 'SDLP'];
        // const infiniteLoops = [];

        // TODO: fundamentals accounting error cannot find year (every time on another filing) (due to acces denied files)
        // const cannotFindYear = ['DAL', 'EBAY', 'MCD', 'NLS', 'P', 'PFE', 'PG', 'SAVE', 'ADSK', 'AIZ', 'AKS'];
        // 'AMBC', 'AFL', 'AAT', 'AES',
        const cannotFindYear = [];

        // TODO: not well formed xml
        const malFormedXml = ['VECO', 'DBC', 'MRVL', 'UUP'];

        const exceptions = [...infiniteLoops, ...cannotFindYear, ...malFormedXml];

        if(unparsed && _.includes(exceptions, stock.ticker) === false) {
          return stock;
        } else {
          return findStockWithUnparsedFilingsByStocks(_.tail(stocks));
        }
      });
  }
};

const findAllStocksWithUnparsedFilings = () => {
  return Service.getStocksFromResources()
    .then(stocks => _.values(stocks))
    .then(findAllStocksWithUnparsedFilingsBy);
};

const findAllStocksWithUnparsedFilingsBy = (stocks, unparsedStocks = []) => {
  if(_.isEmpty(stocks)) {
    return unparsedStocks;
  } else {
    const stock = _.first(stocks);

    return Service.hasUnparsedFilings(stock)
      .then((unparsed) => {
        if(unparsed) {
          unparsedStocks.push(stock);
        }
        return findAllStocksWithUnparsedFilingsBy(_.tail(stocks), unparsedStocks);
      });
  }
};

const parseUnparsedFilings = () => {
  return findStockWithUnparsedFilings()
    .then((stock) => {
      if(stock) {
        console.log(`parsing filings candidate: ${stock.ticker}`);

        parseOnlyUnparsedFilings(stock.ticker)
          .then(() => {
            return Service.lockParsedStock(stock.ticker);
          })
          .then(() => {
            parseUnparsedFilings();
          })
      }
    })
};

const getTickersWithoutSummaries = () => {
  return Service.getTickersFromResources()
    .then((tickers) => {
      return _.filter(tickers, (ticker) => {
        const filepath = Service.getSummaryFilepath(ticker);
        return fs.existsSync(filepath) === false;
      });
    });
};

const getStocksMissingFilingEntries = () => {
  return Service.getStocksFromResources()
    .then((stocks) => {
      return _
        .chain(_.values(stocks))
        .filter((stock) => {
          return _.has(stock, 'filings.annual.filings.entries') === false ||
                 _.has(stock, 'filings.quarterly.filings.entries') === false;
        })
        .keyBy('ticker')
        .value();
    });
};

const updateMissingStockFilings = (tickers) => {
  let source;

  if(_.isArray(tickers)) {
    if(tickers.length === 0) {
      console.log('filings of all tickers have been updated!');
      return Promise.resolve(null);
    }

    source = Promise.resolve(tickers);
  } else {
    source = Service.getTickersFromResources();
  }

  return source.then((tickers) => {
    const ticker = _.first(tickers);

    if(ticker) {
      console.log(`crawl filings of candidate: ${ticker}. ${tickers.length} stocks left!`);

      return updateAnnualFilings(ticker)
        .then(() => {
          return updateQuarterlyFilings(ticker);
        })
        .then(() => {
          return Promise.delay(3000);
        })
        .then(() => {
          return updateMissingStockFilings(_.tail(tickers));
        });
    } else {
      return updateMissingStockFilings([]);
    }
  })
};

const downloadMissingFilingFilesBy = (tickers) => {
  let source;

  if(tickers) {
    if(tickers.length === 0) {
      console.log('filings of all tickers have been downloaded!');
      return Promise.resolve(null);
    }

    source = Promise.resolve(tickers);
  } else {
    source = Service.getTickersFromResources();
  }

  return source.then((tickers) => {
    const ticker = _.first(tickers);

    if(ticker) {
      console.log(`dowload filings of candidate: ${ticker}`);

      return downloadMissingInteractiveFilingsBy(ticker)
        // .then(() => {
        //   return Promise.delay(3000);
        // })
        .then(() => {
          return downloadMissingFilingFilesBy(_.tail(tickers));
        })
        .catch(() => {
          console.error(`failed to download all files of ${ticker}!`);
          return downloadMissingFilingFilesBy(_.tail(tickers));
        })
    } else {
      return downloadMissingFilingFilesBy([]);
    }
  })
};

const getTickersFromResourcesFrom = (ticker) => {
  return Service.getTickersFromResources()
    .then((tickers) => {
      const index = tickers.indexOf(ticker);
      return tickers.slice(index);
    })
};

const unlinkAllBrokenFiles = (tickers) => {
  let source;

  if(tickers) {
    if(tickers.length === 0) {
      console.log('files of all tickers have been cleared!');
      return Promise.resolve(null);
    }

    source = Promise.resolve(tickers);
  } else {
    source = Service.getTickersFromResources();
  }

  return source
    .then((tickers) => {
      const ticker = _.first(tickers);

      if(ticker) {
        return Service.unlinkBrokenFiles(ticker)
          .then(() => {
            return unlinkAllBrokenFiles(_.tail(tickers));
          })
      }
    })
};

module.exports = {
  crawlFilingsByStock,

  crawlAnnualFilingsByQueryParams,
  crawlQuarterlyFilingsByQueryParams,

  crawlAnnualFilings,
  crawlQuarterlyFilings,

  crawlMissingAnnualFilings,
  crawlMissingQuarterlyFilings,

  updateAnnualFilings,
  updateQuarterlyFilings,
  updateMissingStockFilings,

  crawlAndDownload,
  crawlStock,
  crawlStocks,
  create: Service.create,

  downloadMissingInteractiveFilingsBy,
  downloadMissingFilingFilesBy,
  downloadAnnualFiles,
  downloadQuarterlyFiles,

  exists,

  find,
  findStockByTicker: Service.findByTicker,
  filterFilings,
  findStockWithUnparsedFilings,
  findAllStocksWithUnparsedFilings,

  getAllFilings,
  getFilingBatches,
  getMetrics,
  getTickersFromResourcesFrom,
  getTickersWithoutSummaries,
  getStocksMissingFilingEntries,

  hasEmptyFilings: Service.hasEmptyFilings,
  parseFilingFilesByTicker,
  parseFilings,
  remove: Service.remove,
  save: Service.save,
  saveSummary: Service.saveSummary,
  parseUnparsedFilings,
  parseOnlyUnparsedFilings,

  findBrokenFiles: Service.findBrokenFiles,
  unlinkBrokenFiles: Service.unlinkBrokenFiles,
  unlinkAllBrokenFiles,
}
