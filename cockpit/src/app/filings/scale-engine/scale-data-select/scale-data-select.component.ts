import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

import * as _ from 'lodash';

@Component({
  selector: 'sec-scale-data-select',
  templateUrl: './scale-data-select.component.html',
  styleUrls: ['./scale-data-select.component.scss']
})
export class ScaleDataSelectComponent implements OnInit, OnChanges {

  @Input() breadcumbs: any[] = [];
  @Input() node: any;

  @Output() change = new EventEmitter<any>();

  public branch: any[];
  public path: any;
  public previousPath: any;
  public child: any;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.node) {
      this.branch = null;
      this.path = null;
      this.child = null;

      if(this.node) {
        if(this.node.values) {
          this.send(this.breadcumbs);
        } else {
          this.branch = _.keys(this.node).sort();
        }
      }
    }
  }

  send(message: any) {
    this.change.emit(message);
  }

  selectPath(event) {
    if(this.previousPath) {
      const index = _.indexOf(this.breadcumbs, this.previousPath);
      if(index > -1) _.pull(this.breadcumbs, ...this.breadcumbs.slice(index));
    }

    this.breadcumbs.push(this.path);
    this.child = _.get(this.node, this.path);
    this.previousPath = this.path;

    this.send(null);
  }

}
