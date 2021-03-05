import { Component, OnInit } from '@angular/core';

import { DiaryService } from './diary.service';

import * as Summary from './summary';

import * as _ from 'lodash';

// FILTERS:
const filterMidTerm = (candidates) => {
  return _
    .chain(candidates)
    .filter(item => item.health === 'durable')
    .filter(item => item.growth === 'durable')
    .filter(item => _.includes(['VERY HIGH', 'HIGH'], item.uncertainty) === false)
    .value();
};

const findByScores = (stocks, property = 'fcf_mos') => {
  return _
    .chain(stocks)
    .filter(stock => _.get(stock, 'valuation.score') > 50)
    .filter(property)
    .filter(stock => stock[property] > 0)
    // .filter(stock => stock['deps_mos'] > 0)
    // .filter(stock => stock['oeps_mos'] > 0)
    .filter(stock => stock['fcf_mos'] > 0.7)
    .orderBy(['valuation.score', property], ['desc', 'asc'])
    // .orderBy(['valuation.score'], ['desc'])
    .value();
};

const findAllByScoreMargin = (stocks, scenario = 'longterm', dcfType = 'fcf') => {
  return _
    .chain(stocks)
    .filter(stock => _.get(stock, 'valuation.score') > 50)
    // .take(1)
    .forEach(stock => stock.marginScore = getScoreByMargin(stock, scenario, dcfType))
    // .filter(stock => stock.marginScore > 0)
    // .filter(stock => stock['deps_mos'] > 0)
    // .filter(stock => stock['oeps_mos'] > 0)
    .filter(stock => stock['fcf_mos'] > 0.2)
    .orderBy(['marginScore', 'valuation.score'], ['desc', 'desc'])
    // .orderBy(['valuation.score'], ['desc'])
    // .map(item => _.pick(item, ['ticker', 'marginScore']))
    .value();
};

const getScoreByMargin = (item, scenario = 'longterm', dcfType = 'fcf') => {
  if(item.valuation) {
    const dcfs = item.valuation.dcfs[scenario];
    const marginOfSafety = dcfs[dcfType] > 0 ? 1 - item.price/dcfs[dcfType] : 0;

    let score = item.valuation.score * (1 + marginOfSafety);
    score = Math.max(score, 0);
    score = Math.min(score, 100);

    return score;
  }

  return 0;
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

  public audit: any = {
    portfolio: null,
    universe: null
  };

  public universe: any = {
    selected: 'SCORES',
    getters: {
      'SCORES': _ => findByScores(this.summary.stocks),
      'SCORES_MIDTERM': _ => filterMidTerm(findByScores(this.summary.stocks)),
      'CANDIDATES': _ => this.candidates,
    },
  };

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

  constructor(private diary: DiaryService) {
    this.universe.options = _.keys(this.universe.getters);
  }

  ngOnInit() {
    this.diary.getDays().subscribe((days) => {
      this.days = days;
      this.day = _.last(this.days);
      if(this.day) this.getSummary(this.day);
    });
  }

  getSummary(day: string) {
    this.diary.getSummary(day).subscribe((summary) => {
      this.summary = Summary.prepare(summary);
      this.candidates = this.getCandidates(this.summary.stocks);
      this.evaluatePortfolio();
      this.setUniverse(this.universe.selected);
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

  setUniverse(selected?: string) {
    selected = selected || this.universe.selected;

    this.audit.portfolio = this.summary.portfolio;
    const getter = this.universe.getters[selected];
    this.audit.universe = getter ? getter() : [];

    // console.log('universe', this.audit.universe);

    // const candidates = filterMidTerm(this.candidates);
    // const candidates = filterMidTerm(findByScores(this.summary.stocks));
    // const candidates = _.shuffle(findByScores(this.summary.stocks));
    // const candidates = findAllByScoreMargin(this.summary.stocks);
    // const candidates = filterMidTerm(findAllByScoreMargin(this.summary.stocks));
  }

}
