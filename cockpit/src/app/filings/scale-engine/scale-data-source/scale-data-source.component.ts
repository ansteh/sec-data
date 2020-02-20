import { Component, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';

import * as _ from 'lodash';

@Component({
  selector: 'sec-scale-data-source',
  templateUrl: './scale-data-source.component.html',
  styleUrls: ['./scale-data-source.component.scss']
})
export class ScaleDataSourceComponent implements OnInit, OnChanges {

  @Input() breadcrumbs: any[] = [];
  @Input() metrics: any;

  public nodes: any[];

  constructor() { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.metrics) {
      if(this.metrics && !this.nodes) {
        this.restart();
      }
    }

    if(changes.breadcrumbs && this.nodes) {
      if(this.breadcrumbs.length === 0) {
        this.restart();
      } else {
        this.nodes = [];

        let source = this.metrics;

        this.breadcrumbs.forEach((key, index) => {
          this.nodes.push({
            path: key,
            options: _.keys(source),
            source: source,
          });

          source = _.get(source, key);
        });
      }
    }
  }

  restart() {
    this.nodes = [];
    this.nodes.push({
      path: null,
      options: _.keys(this.metrics),
      source: this.metrics,
    });
  }

  select(node, index) {
    this.nodes = this.nodes.slice(0, index+1);
    _.pull(this.breadcrumbs, ...this.breadcrumbs.slice(index));

    this.breadcrumbs.push(node.path);

    const source = _.get(node.source, node.path);
    if(source && !source.values) {
      this.nodes.push({
        path: null,
        options: _.keys(source),
        source: source,
      });
    }
  }

}
