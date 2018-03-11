const _           = require('lodash');

const StockService  = require('../lib/stock/service.js');
const PriceService  = require('../lib/stock/price/service.js');

const prepareHistoricals = (historicals) => {
  return _.map(historicals, (historical) => {
    historical.date = new Date(historical.date);
    return historical
  });
};

const prepareFundamentals = (concepts) => {
  return _.map(concepts, (concept) => {
    if(_.has(concept, 'DocumentPeriodEndDate')) {
      concept.DocumentPeriodEndDate = new Date(concept.DocumentPeriodEndDate);
    }

    return concept;
  })
};

const prepareMetric = (entries) => {
  return _.map(entries, (entry) => {
    if(_.has(entry, 'startDate')) {
      entry.startDate = new Date(entry.startDate);
    }

    if(_.has(entry, 'endDate')) {
      entry.endDate = new Date(entry.endDate);
    }

    if(_.has(entry, 'date')) {
      entry.date = new Date(entry.date);
    }

    return entry;
  })
};

const prepareSummarySection = (summary) => {
  if(_.has(summary, 'FundamentalAccountingConcepts')) {
    summary.FundamentalAccountingConcepts = prepareFundamentals(summary.FundamentalAccountingConcepts);
  }

  const metrics = _.remove(_.keys(summary), key => key !== 'FundamentalAccountingConcepts');
  _.forEach(metrics, (metric) => {
    summary[metric] = prepareMetric(summary[metric]);
  });

  return summary;
};

const prepareSummary = (summary) => {
  _.forEach(['annual', 'quarterly'], (section) => {
    if(_.has(summary, section)) {
      summary[section] = prepareSummarySection(summary[section]);
    }
  });

  return summary;
};

const getStock = (ticker) => {
  const stock = {};

  return StockService.findByTicker(ticker)
    .then((resource) => {
      if(resource) {
        stock.resource = resource;
      }

      return StockService.getSummary(ticker);
    })
    .then((summaries) => {
      const summary = _.get(summaries, ticker);
      if(summary) {
        stock.summary = prepareSummary(summary);
      }

      return PriceService.get(ticker);
    })
    .then((historicals) => {
      if(historicals) {
        stock.historicals = prepareHistoricals(historicals);
      }

      return stock;
    })
};

const getAllTickers = () => {
  return StockService.getTickersFromResources();
};

module.exports = {
  getAllTickers,
  getStock,
};
