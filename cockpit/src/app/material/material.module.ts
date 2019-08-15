import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
  MatButtonModule,
  MatButtonToggleModule,
  MatCheckboxModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatSliderModule,
  MatTableModule,
  MatOptionModule,
  MatSelectModule,
} from '@angular/material';

const modules = [
  MatButtonModule,
  MatButtonToggleModule,
  MatCheckboxModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatTableModule,
  MatSliderModule,
  MatOptionModule,
  MatSelectModule,
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
