import { Component, OnInit, Input } from '@angular/core';

import { forkJoin } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { DiaryService } from './../../diary/diary.service';
import { ScaleEngineService } from './../scale-engine/scale-engine.service';

import * as _ from 'lodash';

const periodes = ['caped', 'longterm', 'midterm'];
const properties = ['deps', 'oeps', 'fcf'];

const assignMarginOfSafety = (report: any) => {
  const { price } = report || { price: null };

  if(_.isNumber(price) && report.dcfs) {
    _.forEach(periodes, (periode) => {
      const dcfs = _.get(report.dcfs, periode);

      _.forEach(properties, (property) => {
        const value = _.get(dcfs, property);
        if(value > 0) _.set(report, ['mos', periode, property], 1 - price/value);
      });
    });
  }
};

@Component({
  selector: 'sec-scale-ranking',
  templateUrl: './scale-ranking.component.html',
  styleUrls: ['./scale-ranking.component.scss']
})
export class ScaleRankingComponent implements OnInit {

  @Input() filename: string = 'buffet';

  public displayedColumns = [
    'ticker',
    'score',
    'avg',
    'change',
    'price',
    'diluted',
    'operating',
    'fcf',
    'mean',
    'estimate',
  ];

  public reports: any[] = [];
  public entryType: string = 'mos';
  public periode: string = 'caped';

  constructor(private diary: DiaryService, private engine: ScaleEngineService) { }

  ngOnInit() {
    this.getReports();
  }

  getMeasure(row): any {
    return _.get(row, [this.entryType, this.periode]) || {};
  }

  getMean(row): any {
    const measure = this.getMeasure(row);

    return _
      .chain(properties)
      .map(property => measure[property])
      .filter()
      .mean()
      .value();
  }

  getEstimate(row): any {
    const mean = this.getMean(row);

    if(mean > 0) {
      return mean * row.score;
    }

    return 0;
  }

  sortByEstimate() {
    _.forEach(this.reports, (report) => {
      report.estimate = this.getEstimate(report);
    });

    this.reports = _.orderBy(this.reports, ['estimate', 'score'], ['desc', 'desc']);
  }

  getReports() {
    const reports = this.engine.getTemplate(this.filename)
      .pipe(mergeMap(template => this.engine.createReports(template)));

    const prices = this.diary.getDays()
      .pipe(
        map(days => _.last(days)),
        mergeMap(day => this.diary.getSummary(day)),
        map((summary: any) => {
          return _
            .chain(_.get(summary, 'stocks'))
            .map(({ ticker, price }) => {
              return {
                ticker: _.last(ticker.split(':')),
                price,
              };
            })
            .filter(stock => _.isNumber(stock.price))
            .reduce((store, { ticker, price }) => {
              store[ticker] = price;
              return store;
            }, {})
            .value();
        })
      );

    forkJoin([prices, reports])
      .pipe(map(([prices, reports]) => {
        _.forEach(reports, (report) => {
          report.price = prices[report.ticker];
          assignMarginOfSafety(report);
        });

        return reports;
      }))
      .subscribe((reports: any) => {
        this.reports = reports;
        this.sortByEstimate();
        console.log('this.reports', this.reports);
      });
  }

}
