import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { MenuStatus } from '../../../../core/enums/menu-status.enum';
import { OrderStatus } from '../../../../core/enums/order-status.enum';
import { MenuService } from '../../../menu/menu.service';
import { OrdersService } from '../../orders.service';
import { TablesService } from '../../tables.service';
import { OrderCreateComponent } from './order-create.component';

describe('OrderCreateComponent', () => {
  let menu: jasmine.SpyObj<MenuService>;
  let tables: jasmine.SpyObj<TablesService>;
  let orders: jasmine.SpyObj<OrdersService>;
  let router: jasmine.SpyObj<Router>;
  let query: Record<string, string>;

  beforeEach(async () => {
    menu = jasmine.createSpyObj<MenuService>('MenuService', ['available']);
    tables = jasmine.createSpyObj<TablesService>('TablesService', ['available']);
    orders = jasmine.createSpyObj<OrdersService>('OrdersService', ['create']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    query = {};
    menu.available.and.returnValue(of([]));
    tables.available.and.returnValue(of([]));
    orders.create.and.returnValue(
      of({
        id: 'order-1',
        status: OrderStatus.PENDING,
        total: 50,
        items: [],
      }),
    );

    await TestBed.configureTestingModule({
      imports: [OrderCreateComponent],
      providers: [
        { provide: MenuService, useValue: menu },
        { provide: TablesService, useValue: tables },
        { provide: OrdersService, useValue: orders },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: { get: (key: string) => query[key] || null } },
          },
        },
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
    expect(fixture.nativeElement.querySelector('.products .empty')?.textContent).toContain(
      'No hay productos disponibles',
    );
  });

  it('preselects the reserved table and links it when creating the order', () => {
    query = {
      tableId: 'table-1',
      reservationId: 'reservation-1',
      customer: 'Ana Pérez',
    };
    const product = {
      id: 'menu-1',
      name: 'Hamburguesa',
      price: 25,
      status: MenuStatus.AVAIBLE,
    };
    menu.available.and.returnValue(of([product]));
    tables.available.and.returnValue(of([{ id: 'table-1', number: 4 }]));
    const component = TestBed.createComponent(OrderCreateComponent).componentInstance;

    component.ngOnInit();
    component.setQuantity(product, 2);
    component.save();

    expect(component.tableId).toBe('table-1');
    expect(orders.create).toHaveBeenCalledOnceWith({
      tableId: 'table-1',
      reservationId: 'reservation-1',
      items: [{ menuItemId: 'menu-1', quantity: 2 }],
      status: OrderStatus.PENDING,
    });
    expect(router.navigate).toHaveBeenCalledWith(['/orders', 'order-1']);
  });
});
