import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { OrderStatus } from '../../../../core/enums/order-status.enum';
import { RealtimeService } from '../../../../core/services/realtime.service';
import { AuthService } from '../../../auth/auth.service';
import { OrdersService } from '../../orders.service';
import { OrdersListComponent } from './orders-list.component';

describe('OrdersListComponent', () => {
  let orders: jasmine.SpyObj<OrdersService>;
  let role = 'waiter';

  beforeEach(async () => {
    role = 'waiter';
    orders = jasmine.createSpyObj<OrdersService>('OrdersService', ['list', 'my']);
    orders.my.and.returnValue(of([]));
    orders.list.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [OrdersListComponent],
      providers: [
        provideRouter([]),
        { provide: OrdersService, useValue: orders },
        { provide: AuthService, useValue: { user: () => ({ role: { name: role } }) } },
        { provide: RealtimeService, useValue: { on: () => undefined } },
      ],
    }).compileComponents();
  });

  it('shows an empty state after loading', () => {
    const fixture = TestBed.createComponent(OrdersListComponent);

    fixture.detectChanges();

    expect(orders.my).toHaveBeenCalled();
    expect(fixture.componentInstance.loading).toBeFalse();
    expect(fixture.nativeElement.querySelector('.empty')?.textContent).toContain('No hay órdenes');
  });

  it('uses readable labels for order statuses', () => {
    const component = TestBed.createComponent(OrdersListComponent).componentInstance;

    expect(component.statusLabel(OrderStatus.PENDING)).toBe('Pendiente');
    expect(component.statusLabel(OrderStatus.IN_PROGRESS)).toBe('En preparación');
    expect(component.statusLabel(OrderStatus.COMPLETED)).toBe('Completada');
  });

  it('shows a retry action when loading fails', () => {
    orders.my.and.returnValue(throwError(() => new Error('network')));
    const fixture = TestBed.createComponent(OrdersListComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance.error).toContain('No se pudieron cargar');
    expect(fixture.nativeElement.querySelector('.error button')?.textContent).toContain('Reintentar');
  });

  it('hides order creation from kitchen users', () => {
    role = 'kitchen';
    const fixture = TestBed.createComponent(OrdersListComponent);

    fixture.detectChanges();

    expect(orders.list).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.new-order')).toBeNull();
  });
});
