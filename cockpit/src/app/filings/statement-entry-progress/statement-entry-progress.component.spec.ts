import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatementEntryProgressComponent } from './statement-entry-progress.component';

describe('StatementEntryProgressComponent', () => {
  let component: StatementEntryProgressComponent;
  let fixture: ComponentFixture<StatementEntryProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatementEntryProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatementEntryProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
