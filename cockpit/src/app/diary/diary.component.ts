import { Component, OnInit } from '@angular/core';

import { DiaryService } from './diary.service';

import * as _ from 'lodash';

const BENCHMARKS = {
  worst: {
    health: {
      danger: 0,
      medicore: 0.4,
      durable: 0.8,
    },
  },
  medicore: {
    health: {
      danger: 0.2,
      medicore: 0.6,
      durable: 0.9,
    },
  },
  durable: {
    health: {
      danger: 0.4,
      medicore: 0.7,
      durable: 1,
    },
  }
};

const profile = (stock) => {
  let health = 0;
  if(stock.debtToEquity <= 1) health += 1;
  if(stock.currentRatio >= 0.7) health += 1;
  if(stock.currentRatio >= 0.7) health += 1;
  stock.health = health === 3 ? 'durable' : 'medicore';
  stock.health = health < 2 ? 'danger' : stock.health;

  let growth = 0;
  if(stock.revenue_cagr_5 >= 0.05) growth += 1;
  // if(stock.cashPerShare > 0) stock.growth += 1;
  stock.growth = growth > 0 ? 'durable' : 'medicore';

  // let upside = 0;
  // if(stock.peg < 1.5) stock.upside += 1;
  // if(stock.adjustedPE < 20) stock.upside += 1;
  // stock.upside = upside === 2 ? 'durable' : 'medicore';
};

const getEstimatedValue = (stock) => {
  // return stock.fairValue || 0;
  // return stock.analystValue || 0;
  return _
    .chain([stock.fairValue, stock.analystValue])
    .filter()
    .filter(_.isNumber)
    .mean()
    .value();
};

const getNominalValue = ({ count, stock }) => {
  return count * stock.price;
};

const analyse = (portfolio, benchmarks) => {
  const assets = _.filter(portfolio, stock => stock.count);
  const [stocks, unmatches] = _.partition(assets, item => item.stock);
  // if(unmatches.length > 0) console.log('unmatches', unmatches);

  let totalValue = _.sumBy(stocks, getNominalValue),
    marginOfSafety = 0,
    downside = 0,
    upside = 0;

  _.forEach(stocks, (stock) => {
    const value = getNominalValue(stock);
    stock.weight = value/totalValue;
    // stock.marginOfSafety = stock.marginOfSafety || stock.stock.marginOfSafety;
    stock.marginOfSafety = stock.stock.fcf_mos; //stock.marginOfSafety || stock.stock.marginOfSafety;

    if(stock.marginOfSafety) {
      marginOfSafety += stock.weight * stock.marginOfSafety;
      downside += benchmarks.health[stock.stock.health] * value * (1 + stock.marginOfSafety);
      upside += value * (1 + stock.marginOfSafety);
    }
  });

  totalValue = _.round(totalValue, 2);
  downside = _.round(downside, 2);
  upside = _.round(upside, 2);

  // console.log('stocks', _.map(stocks, 'stock'));

  return {
    value: totalValue,
    downside: downside/totalValue-1,
    upside: upside/totalValue-1,
    range: {
      downside,
      upside,
    },
    marginOfSafety,
    misfits: _.filter(stocks, stock => !stock.marginOfSafety)
  };
};

const getValuation = (positions) => {
  return _
    .chain(positions)
    .sumBy((position) => {
      if(_.has(position, 'stock.valuation.score')) {
        return position.weight * _.get(position, 'stock.valuation.score') || 0;
      } else {
        console.log(`No score defined for:`, position);
        return 0;
      }
    })
    .value();
};

@Component({
  selector: 'sec-diary',
  templateUrl: './diary.component.html',
  styleUrls: ['./diary.component.scss']
})
export class DiaryComponent implements OnInit {

  public days: string[];
  public day: string;
  public summary: any;

  public portfolio: any;
  public candidates: any[];

  public columns: any = {
    portfolio: [
      // { label: 'Name', property: 'name' },
      { property: 'ticker', label: 'Ticker' },
      { property: 'count', label: 'Count', type: 'integer' },
      { property: 'value', label: 'Value', type: 'number' },
      { property: 'marginOfSafety', label: "Margin %", type: 'number' },

      { property: 'health', label: "Health", type: 'right' },
      { property: 'growth', label: "Growth", type: 'right' },
      // { property: 'upside', label: "Upside", type: 'right' },
      { property: 'suggestion', label: "Suggestion", type: 'right' },
    ],
    stocks: [
      { property: 'name', label: "Name" },
      { property: 'ticker', label: "Full Ticker" },
      { property: 'marginOfSafety', label: "Margin %", type: 'number' },
      { property: 'price', label: "Price", type: 'number' }, // Stock Price (Current)
      // { property: 'cashPerShare', label: "Cash per Share", type: 'number' }, // Stock Price (Current)
      { property: 'fairValue', label: "Fair Value (Finbox)", type: 'number' },
      { property: 'uncertainty', label: "Fair Value Uncertainty", type: 'align-right' }, // Fair Value Uncertainty (Finbox Fair Value)
      { property: 'analystValue', label: "Analyst Target", type: 'integer' }, // Fair Value (Analyst Target)
      { property: 'dividendYield', label: "Dividend Yield", type: 'number' },
      { property: 'adjustedPE', label: "P/E Ratio (Adjusted)", type: 'number' },
      { property: 'peg', label: "PEG Ratio", type: 'number' },
      { property: 'revenue_cagr_5', label: "Revenue CAGR (5y)", type: 'number' },
      { property: 'debtToEquity', label: "Debt / Equity", type: 'number' },
      { property: 'currentRatio', label: "Current Ratio", type: 'number' },
      { property: 'quickRatio', label: "Quick Ratio", type: 'number' },
      { property: 'freeCashFlow', label: "FCF", type: 'number' }, // Levered Free Cash Flow
      { property: 'shares', label: "Diluted Shares", type: 'number' }, // Weighted Average Diluted Shares Out.
    ]
  };

  constructor(private diary: DiaryService) { }

  ngOnInit() {
    this.diary.getDays().subscribe((days) => {
      this.days = days;
      this.day = _.last(this.days);
      if(this.day) this.getSummary(this.day);
    });
  }

  getSummary(day: string) {
    this.diary.getSummary(day).subscribe((summary) => {
      this.summary = summary;

      this.summary.stocks.forEach((item) => {
        item.cashPerShare = item.freeCashFlow/item.shares;
        item.estimatedValue = getEstimatedValue(item);
        item.marginOfSafety = 1 - item.price/item.estimatedValue;
        profile(item);

        if(item.valuation) {
          const dcfs = item.valuation.dcfs.longterm;
          if(dcfs.deps > 0) item.deps_mos = 1 - item.price/dcfs.deps;
          if(dcfs.oeps > 0) item.oeps_mos = 1 - item.price/dcfs.oeps;
          if(dcfs.fcf > 0) item.fcf_mos = 1 - item.price/dcfs.fcf;
        }
      });

      this.summary.portfolio.forEach((item) => {
        item.stock = _.find(this.summary.stocks, (stock) => {
          return _.last(stock.ticker.split(':')) === item.ticker;
        });

        if(item.stock) {
          item.marginOfSafety = item.stock.marginOfSafety;
          item.health = item.stock.health;
          item.growth = item.stock.growth;
          item.upside = item.stock.upside;

          if(item.health === 'durable' && item.growth === 'durable') {
            item.suggestion = 'HOLD';
          } else if(item.health === 'danger' || item.growth === 'danger') {
            item.suggestion = 'SELL';
          } else {
            item.suggestion = 'EXAMINE';
          }
        }
      });

      this.candidates = this.getCandidates(this.summary.stocks);
      this.evaluatePortfolio();

      // DCFs:

      const findByScores = (property = 'fcf_mos') => {
        return _
          .chain(this.summary.stocks)
          .filter(stock => _.get(stock, 'valuation.score') > 50)
          .filter(property)
          .filter(stock => stock[property] > 0)
          // .filter(stock => stock['deps_mos'] > 0)
          // .filter(stock => stock['oeps_mos'] > 0)
          .filter(stock => stock['fcf_mos'] > 0.7)
          .orderBy(['valuation.score', property], ['desc', 'asc'])
          .value();
      };

      const preview = _
        .chain(findByScores())
        .map((stock) => {
          return _.assign(
            {},
            stock.valuation,
            _.pick(stock, ['deps_mos', 'oeps_mos', 'fcf_mos']),
          );
        })
        .value();

      console.log('preview', preview);

      const filterMidTerm = (candidates) => {
        return _
          .chain(candidates)
          .filter(item => item.health === 'durable')
          .filter(item => item.growth === 'durable')
          .filter(item => _.includes(['VERY HIGH', 'HIGH'], item.uncertainty) === false)
          .value();
      };

      // Audit:

      const benchmarks = BENCHMARKS;

      const current = this.createAudit('current portfolio', this.summary.portfolio);
      this.logAudit(current);

      // const candidates = filterMidTerm(this.candidates);
      // const candidates = filterMidTerm(findByScores());
      // const candidates = _.shuffle(findByScores());
      const candidates = findByScores();

      const counterPortfolio = this.createPortfolio({
        candidates,
        budget: current.value,
        // count: 7,
      });
      console.log('counterPortfolio', counterPortfolio);

      const counter = this.createAudit('counter portfolio', counterPortfolio);
      this.logAudit(counter);
    });
  }

  private getCandidates(stocks) {
    return _
      .chain(stocks)
      .filter(item => item.fairValue > 0)
      .filter(item => item.marginOfSafety > 0)
      .filter(item => item.currentRatio > 0.7)
      .filter(item => item.quickRatio > 0.7)
      // .filter(item => item.health === 'durable')
      // .filter(item => item.growth === 'durable')
      .orderBy(['marginOfSafety'], ['desc'])
      // .take(20)
      .value();
  }

  private evaluatePortfolio() {
    // console.log(this.summary.portfolio);

    const stats = _.reduce(this.summary.portfolio, (stats, item) => {
      if(item.suggestion) stats[_.toLower(item.suggestion)] += 1;
      return stats;
    }, { hold: 0, sell: 0, examine: 0});
    // console.log('stats', stats);

    const stocks = _.filter(this.summary.portfolio, stock => stock.count);

    this.portfolio = { stats };
    this.portfolio.value = _.round(_.sumBy(stocks, 'value'), 2);
    this.portfolio.cash = _.round(_.sumBy(this.summary.portfolio, 'value') - this.portfolio.value, 2);

    this.portfolio.sells = _
      .chain(stocks)
      .filter(item => item.suggestion === 'SELL')
      .sortBy('stock.marginOfSafety')
      .value();

    this.portfolio.buys = _
      .chain(this.candidates)
      .filter(item => item.health === 'durable')
      .filter(item => item.growth === 'durable')
      .forEach(item => item.suggestion = 'BUY')
      .orderBy(['marginOfSafety'], ['desc'])
      .take(this.portfolio.sells.length)
      .value();
  }

  private createAudit(label: string, portfolio: any) {
    const benchmarks = BENCHMARKS;

    const audit = {
      label,
      scenarios: {},
      score: null,
      value: null,
    };

    _.forOwn(benchmarks, (setup, scenario) => {
      audit.scenarios[scenario] = analyse(portfolio, setup);
      audit.value = audit.scenarios[scenario].value;
    });

    audit.score = getValuation(portfolio);

    return audit;
  }

  logAudit(audit: any) {
    console.log(audit.label);

    _.forOwn(audit.scenarios, (results, scenario) => {
      console.log(scenario, results);
    });

    console.log('portfolio company score:', audit.score);
  }

  createPortfolio({ candidates, budget, count = 20 }) {
    let budgetPerStock = budget/count;

    // console.log('starting budget', budget);
    // console.log('budgetPerStock', budgetPerStock);

    const portfolio = _
      .chain(candidates)
      .take(count)
      .orderBy(['price'], ['desc'])
      .map((stock, index) => {
        let amount = _.floor(Math.min(budget, budgetPerStock)/stock.price);
        if(amount === 0 && budget > stock.price) amount = 1;
        budget -= amount * stock.price;

        return { count: amount, stock };
      })
      .orderBy(['marginOfSafety'], ['desc'])
      .value();

    if(budget > 0) {
      do {
        const stock = _.find(portfolio, item => budget > item.stock.price);

        if(stock) {
          const amount = _.floor(Math.min(budget, budgetPerStock)/stock.stock.price);
          console.log('add to ', stock, amount);
          stock.count += amount;
          budget -= amount * stock.stock.price;
        } else {
          break;
        }

      } while(budget > 0);
    }

    return portfolio;
  }

}
