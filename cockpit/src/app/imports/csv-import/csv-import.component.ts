import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

import * as _ from 'lodash';

@Component({
  selector: 'sec-csv-import',
  templateUrl: './csv-import.component.html',
  styleUrls: ['./csv-import.component.scss']
})
export class CsvImportComponent implements OnInit {

  @ViewChild('fileInput') fileInput: ElementRef;

  @Output() upload: any = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  handleFiles(files: FileList) {
    const file: File = _.first(files)

    if(file) {
      var reader = new FileReader();
      reader.onload = (content) => {
        const result = _.get(content, 'target.result');
        const rows = this.parseCSV(result);
        // console.log('rows', rows);
        this.upload.emit(rows);
        this.fileInput.nativeElement.value = '';
      };
      reader.readAsBinaryString(file);
    }
  }

  private parseCSV(text: string) {
    return _
      .chain(text = text || '')
      .split("\n")
      .filter(row => row)
      .map((row) => {
        return row.match(/(".*?"|[^",\s]+|,)(?=\s*,|\s*$)/g)
          .map(this.extractNumber);
      })
      .value();
  }

  private extractNumber(value) {
    if(value === ',') return null;

    if(_.isString(value) === false) return value;

    if(value.indexOf('.')) {
      const candidate = parseFloat(value.trim());
      if(candidate.toString() === value) return candidate;
    }

    const integer = parseInt(value.trim());
    if(integer.toString() === value) return integer;

    return _.trim(value, '"');
  }

}
