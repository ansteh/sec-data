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
    'measure.deps',
    'measure.oeps',
    'measure.fcf',
    'measure.mean',
    'estimate',
  ];

  public reports: any[] = [];
  public sortedReports: any[] = [];

  public entryType: string = 'mos';
  public periode: string = 'longterm';

  constructor(private diary: DiaryService, private engine: ScaleEngineService) { }

  ngOnInit() {
    this.getReports();
  }

  sortData(event: any) {
    console.log('event', event);

    if(event.direction === '') {
      this.sortedReports = this.reports;
    } else {
      const getValue = (item) => {
        const value = _.get(item, event.active);
        return value ? value : { desc: -1, asc: 1 }[event.direction]*1000;
      };

      this.sortedReports = _.orderBy(
        this.reports,
        [getValue, 'score'],
        [event.direction, 'desc']
      );
    }
  }

  sortByEstimate() {
    // _.forEach(this.reports, (report) => {
    //   report.estimate = this.getEstimate(report);
    // });

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
        this.setFrames();
        console.log('this.reports', this.reports);
        this.sortedReports = _.cloneDeep(this.reports);
      });
  }

  setFrames() {
    _.forEach(this.reports, (report) => {
      report.estimate = this.getEstimate(report);
      report.measure = this.getMeasure(report);
      report.measure.mean = this.getMean(report);
    });
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
}
