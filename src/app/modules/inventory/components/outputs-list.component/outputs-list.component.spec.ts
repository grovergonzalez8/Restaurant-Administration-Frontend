import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutputsListComponent } from './outputs-list.component';

describe('OutputsListComponent', () => {
  let component: OutputsListComponent;
  let fixture: ComponentFixture<OutputsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutputsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutputsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
