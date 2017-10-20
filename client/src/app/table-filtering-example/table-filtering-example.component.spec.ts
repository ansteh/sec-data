import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableFilteringExampleComponent } from './table-filtering-example.component';

describe('TableFilteringExampleComponent', () => {
  let component: TableFilteringExampleComponent;
  let fixture: ComponentFixture<TableFilteringExampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableFilteringExampleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableFilteringExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
