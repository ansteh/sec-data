import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatCheckboxModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatListModule,
  MatSliderModule,
  MatTableModule,
  MatOptionModule,
  MatSelectModule,
  MatSortModule,
} from '@angular/material';

const modules = [
  MatButtonModule,
  MatButtonToggleModule,
  MatCheckboxModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatListModule,
  MatTableModule,
  MatSliderModule,
  MatOptionModule,
  MatSelectModule,
  MatSortModule,
];

@NgModule({
  declarations: [],
  imports: [
    BrowserAnimationsModule,
    ...modules,
  ],
  exports: [
    BrowserAnimationsModule,
    ...modules,
  ]
})
export class MaterialModule { }
