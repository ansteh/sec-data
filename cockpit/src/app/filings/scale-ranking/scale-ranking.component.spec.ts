import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleRankingComponent } from './scale-ranking.component';

describe('ScaleRankingComponent', () => {
  let component: ScaleRankingComponent;
  let fixture: ComponentFixture<ScaleRankingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScaleRankingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleRankingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
