import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { MenuService } from '../../../menu/menu.service';
import { OrdersService } from '../../orders.service';
import { TablesService } from '../../tables.service';
import { OrderCreateComponent } from './order-create.component';

describe('OrderCreateComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderCreateComponent],
      providers: [
        { provide: MenuService, useValue: { available: () => of([]) } },
        { provide: TablesService, useValue: { available: () => of([]) } },
        { provide: OrdersService, useValue: { create: () => of({ id: 'order-1' }) } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    }).compileComponents();
  });

  it('shows clear empty states when no tables or products are available', () => {
    const fixture = TestBed.createComponent(OrderCreateComponent);

    fixture.detectChanges();
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('#order-table') as HTMLSelectElement;
    expect(select.disabled).toBeTrue();
    expect(select.options[0].textContent).toContain('No hay mesas disponibles');
    expect(fixture.nativeElement.querySelector('.products .empty')?.textContent).toContain('No hay productos disponibles');
  });
});
