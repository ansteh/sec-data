import { Component, OnInit } from '@angular/core';

import * as _ from 'lodash';

const TRANSACTION_COLUMNS = [
  'date',
  'time',
  'title',
  'ISIN',
  'exchange',
  'amount',
  'local_share_price_currency',
  'local_share_price',
  'local_total_price_currency',
  'local_total_price',
  'target_total_price_after_fee_currency',
  'target_total_price_after_fee',
  'exchange_rate',
  'exchange_fee_currency',
  'exchange_fee',
  'target_total_price_currency',
  'target_total_price',
];

const TRANSACTION_FLOATS = [
  'local_share_price',
  'local_total_price',
  'target_total_price_after_fee',
  'exchange_rate',
  'exchange_fee',
  'target_total_price',
];

@Component({
  selector: 'sec-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {

  public transactions: any[];

  constructor() { }

  ngOnInit() {
  }

  handleFiles(files: FileList) {
    const file: File = _.first(files)
    // console.log(file);

    if(file) {
      var reader = new FileReader();
      reader.onload = (content) => {
        const result = _.get(content, 'target.result');
        const rows = this.parseCSV(result);
        // console.log(rows);

        this.transactions = this.convertRowsToTransaction(rows);
        console.log(this.transactions);
      };
      reader.readAsBinaryString(file);
    }
  }

  private parseCSV(text: string) {
    return _
      .chain(text = text || '')
      .split("\n")
      .filter(row => row)
      .map(row => row.split(","))
      .value();
  }

  private convertRowsToTransaction(rows: any[]) {
    const header = _.first(rows);

    if(header[0] === 'Datum') {
      rows.shift();
    }

    return _
      .chain(rows)
      .map((row) => {
        return _.reduce(TRANSACTION_COLUMNS, (entry, property, index) => {
          return _.set(entry, property, _.get(row, index));
        }, {});
      })
      .map((entry) => {
        entry.amount = parseInt(_.get(entry, 'amount', 0));

        TRANSACTION_FLOATS.forEach((property) => {
          entry[property] = parseFloat(_.get(entry, property, '').replace(',', '.'));
        });

        return entry;
      })
      .value();
  }

  exportAsJSON(element) {
    if(this.transactions) {
      try {
        const filename = 'transactions.json';
        const body = encodeURIComponent(JSON.stringify(this.transactions, null, 2));
        element.setAttribute('href', `data:text/json;charset=utf-8,${body}`);
        element.setAttribute('download', filename);
        element.click();
      } catch(err) {
        console.log(err);
      }
    }
  }

}
