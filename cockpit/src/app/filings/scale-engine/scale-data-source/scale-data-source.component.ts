import { Component, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';

import * as _ from 'lodash';

@Component({
  selector: 'sec-scale-data-source',
  templateUrl: './scale-data-source.component.html',
  styleUrls: ['./scale-data-source.component.scss']
})
export class ScaleDataSourceComponent implements OnInit, OnChanges {

  @Input() breadcumbs: any[] = [];
  @Input() metrics: any;

  public nodes: any[];

  constructor() { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.metrics) {
      if(this.metrics && !this.nodes) {
        this.nodes = [];
        this.nodes.push({
          path: null,
          options: _.keys(this.metrics),
          source: this.metrics,
        });
      }
    }
  }

  select(node, index) {
    if(index !== this.nodes.length -1) {
      this.nodes = this.nodes.slice(0, index+1);
    }

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
