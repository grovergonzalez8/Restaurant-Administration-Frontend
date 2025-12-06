import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutputsFormComponent } from './outputs-form.component';

describe('OutputsFormComponent', () => {
  let component: OutputsFormComponent;
  let fixture: ComponentFixture<OutputsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutputsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutputsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
