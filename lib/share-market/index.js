const Stock         = require('../stock');
const StockService  = require('../stock/service.js');

const Price         = require('../stock/price');
const PriceModel    = require('../stock/price/model.js');
const PriceService  = require('../stock/price/service.js');

const Model         = require('./model');
const growthRate    = require('../modules/timeseries/growthRate.js');

const Promise = require('bluebird');
const _       = require('lodash');

const getMarket = () => {
  let stocks;

  return StockService.getStocksFromResources()
    .then((resources) => {
      stocks = resources;
    })
    .then(() => {
      return getSummaries(stocks);
    })
    .then(() => {
      return getHistoricals(stocks);
    })
    .then(() => {
      return Model.create(stocks);
    });
};

const getSummaries = (stocks) => {
  return StockService.getSummary(_.keys(stocks))
    .then((summaries) => {
      _.forOwn(summaries, (summary, ticker) => {
        _.set(stocks[ticker], `summary`, summary);
      });
    });
};

const getHistoricals = (stocks) => {
  return Price.getAllAsModels(_.keys(stocks))
    .then((historicals) => {
      _.forOwn(historicals, ({ historical }, ticker) => {
        _.set(stocks[ticker], `historical`, historical);
      });
    });
};

// const INTRINSIC_VALUE_PATH = 'annual.DerivedDCF_IntrinsicValue';
// const INTRINSIC_VALUE_PATH = 'annual.DerivedDCF_IntrinsicValue_MAX_GROWTH_RATE_20';
const INTRINSIC_VALUE_PATH = 'annual.DerivedDCF_IntrinsicValue_MAX_GROWTH_RATE_20_BY_MEAN';
// const INTRINSIC_VALUE_PATH = 'quarterly.DerivedTrailingTwelveMonthsDCF_IntrinsicValue_MAX_GROWTH_RATE_20';
// const INTRINSIC_VALUE_PATH = 'quarterly.DerivedTrailingTwelveMonthsDCF_IntrinsicValue';

getMarket()
  .then((market) => {
    // return [
    //   market.findByFormat('AAOI', '2017-11-28'),
    //   market.findByFormat('AAPL', '2017-11-28'),
    //   market.getMetric('AAPL', 'annual.DerivedDCF_IntrinsicValue'),
    // ];

    // return [
    //   market.getMetricMarginByPrice('AAPL', 'annual.DerivedDCF_IntrinsicValue'),
    //   market.getMetricMarginByPrice('GM', 'annual.DerivedDCF_IntrinsicValue'),
    //   market.getMetricMarginByPrice('GME', 'annual.DerivedDCF_IntrinsicValue'),
    //   market.getMetricMarginByPrice('IBM', 'annual.DerivedDCF_IntrinsicValue'),
    // ];

    // return market.getTickersWithEmptyHistoricals();

    // return market.getAllMetricMarginByPrice('annual.DerivedDCF_IntrinsicValue');

    // return market.getTimeline();

    console.log(market.getSpreadGrowthRateByTicker('AAPL'));

    const scopes = [
      {
        buildTime: 'aot',
        path: INTRINSIC_VALUE_PATH,
        aggregate: 'getAllMetricMarginByPrice',
      },{
        path: 'annual.EarningsPerShareDiluted',
        aggregate: 'getAllMetricByPrice',
        evaluate: (price, value) => {
          return price/value;
        }
      },{
        path: 'annual.DerivedBookValuePerShare',
        aggregate: 'getAllMetricByPrice',
        evaluate: (price, value) => {
          return price/value;
        }
      },{
        // path: 'annual.FundamentalAccountingConcepts.NetIncomeLoss',
        path: 'annual.FundamentalAccountingConcepts.NetCashFlow',
        findFact: ({ facts, date }) => {
          const series = PriceModel.takeByFormat(facts, 'endDate', date, 4);
          const negative = _.find(series, data => data.value < 0);

          const insight = { fact: null };

          if(!negative) {
            insight.fact = (series && series.length > 1) ? _.mean(growthRate(_.map(series, 'value'))) : null;
          }

          return insight;
        },
        aggregate: 'getAllFundamentals',
        evaluate: (price, value) => {
          return value;
        }
      }
    ];

    return Model.createShareMarketTimeline({ market, scopes });
  })
  .then((marketTimeline) => {
    // marketTimeline.simulate(INTRINSIC_VALUE_PATH);
    // return marketTimeline.findAllStates('2012-11-28');
    // return marketTimeline.getMargins('2012-11-28');
  })
  .then(console.log)
  .catch(console.log)
