import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilingsComponent } from './filings.component';

describe('FilingsComponent', () => {
  let component: FilingsComponent;
  let fixture: ComponentFixture<FilingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
