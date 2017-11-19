import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

import * as _ from 'lodash';

import { StockMetricsTreeService } from './stock-metrics-tree.service';

@Component({
  selector: 'sec-stock-metrics-tree',
  templateUrl: './stock-metrics-tree.component.html',
  styleUrls: ['./stock-metrics-tree.component.css']
})
export class StockMetricsTreeComponent implements OnInit, OnChanges {
  @Input() metrics: any;
  @Input() path: string;

  public properties: string[];

  constructor(private metricsTree: StockMetricsTreeService) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.metrics) {
      if(_.isPlainObject(this.metrics)) {
        this.properties = _.keys(this.metrics);
      }
    }
  }

  select(property: string) {
    this.metricsTree.select(`${this.path}.${property}`);
  }

}
