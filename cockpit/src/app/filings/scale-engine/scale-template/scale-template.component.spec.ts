import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleTemplateComponent } from './scale-template.component';

describe('ScaleTemplateComponent', () => {
  let component: ScaleTemplateComponent;
  let fixture: ComponentFixture<ScaleTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScaleTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
