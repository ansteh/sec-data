import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleClauseComponent } from './scale-clause.component';

describe('ScaleClauseComponent', () => {
  let component: ScaleClauseComponent;
  let fixture: ComponentFixture<ScaleClauseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScaleClauseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleClauseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
