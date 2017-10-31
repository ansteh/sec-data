const _       = require('lodash');
const fs      = require('fs-extra');

const Service = require('./service');
const Filings = require('../filings');
const Filing  = require('../filing');
const util    = require('../util.js');

const PeriodReducer = require('./reducers/period.reducer');
const Promise = require('bluebird');

const createFilingsCrawler = (type, count, infoPath) => {
  type = type || '10-K';
  count = count || 100;
  infoPath = infoPath || 'filings.annual';

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
  return Service.filterDownloadInstructions(filterFilings, ticker, formType)
    .then((filings) => {
      return Promise.all(_.map(filings, ({ filingUrl, destination }) => {
        return downloadInstanceFile(filingUrl, destination);
      }));
    });
});

const downloadAnnualFiles = downloadFiles(Service.filterInteractiveAnnualFilings);
const downloadQuarterlyFiles = downloadFiles(Service.filterInteractiveQuarterlyFilings);

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
          .then(() => {
            return parseFilings(stock.ticker);
          });
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

const crawlAndDownloadAnnuals = (ticker, formType) => {
  return crawlAnnualFilings(ticker, { type: formType })
    .then(() => downloadAnnualFiles(ticker, formType));
};

const crawlAndDownloadQuarterls = (ticker, formType) => {
  return crawlQuarterlyFilings(ticker, { type: formType })
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

const getMetrics = (ticker, entry, filter) => {
  return Service.findByTicker(ticker)
    .then(getFormTypes)
    .then(formTypes => getAllFilingsByFormTypes(ticker, formTypes))
    .then((batches) => {
      const filings = _.flatten(batches);
      const entries = _.flatten(Filings.Parser.find(entry, filings))

      return _
        .chain(filter(entries))
        .uniq()
        .value();
    })
    .then(PeriodReducer.toTimeseries);
}

const getFormsByTicker = (ticker) => {
  return Service.findByTicker(ticker)
    .then((stock) => {
      return {
        annual: _.get(stock, 'forms.annual', '10-K'),
        quarterly: _.get(stock, 'forms.quarterly', '10-Q')
      };
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
  getFormsByTicker,
  getMetrics,
  find,
  findStockByTicker: Service.findByTicker,
  hasEmptyFilings: Service.hasEmptyFilings,
  parseFilingFilesByTicker,
  parseFilings,
  remove: Service.remove,
  save: Service.save,
  saveSummary: Service.saveSummary,
}
