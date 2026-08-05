import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TableOverview } from '../../../../core/models/table.model';
import { RealtimeService } from '../../../../core/services/realtime.service';
import { AuthService } from '../../../auth/auth.service';
import { TablesService } from '../../tables.service';
import { DiningRoomComponent } from './dining-room.component';

describe('DiningRoomComponent', () => {
  const freeTable: TableOverview = {
    id: 'table-1',
    number: 1,
    capacity: 4,
    status: 'FREE',
    activeOrder: null,
    nextReservation: {
      id: 'reservation-1',
      customerName: 'Ana Pérez',
      guests: 4,
      reservationAt: '2026-08-04T20:00:00.000Z',
      status: 'CONFIRMED',
    },
  };
  const occupiedTable: TableOverview = {
    id: 'table-2',
    number: 2,
    capacity: 4,
    status: 'OCCUPIED',
    activeOrder: {
      id: 'order-1',
      status: 'READY',
      total: 45.5,
      createdAt: '2026-08-03T18:00:00.000Z',
      waiter: { id: 'waiter-1', name: 'Carlos Mesero' },
    },
    nextReservation: null,
  };
  let tables: jasmine.SpyObj<TablesService>;
  let realtimeCallbacks: Record<string, () => void>;
  let role = 'waiter';

  beforeEach(async () => {
    role = 'waiter';
    realtimeCallbacks = {};
    tables = jasmine.createSpyObj<TablesService>('TablesService', [
      'overview',
      'create',
      'update',
      'remove',
    ]);
    tables.overview.and.returnValue(of([freeTable, occupiedTable]));
    tables.create.and.returnValue(of(freeTable));
    tables.update.and.returnValue(of(freeTable));
    tables.remove.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [DiningRoomComponent],
      providers: [
        provideRouter([]),
        { provide: TablesService, useValue: tables },
        {
          provide: AuthService,
          useValue: { user: () => ({ id: 'waiter-1', role: { name: role } }) },
        },
        {
          provide: RealtimeService,
          useValue: {
            on: (event: string, callback: () => void) =>
              (realtimeCallbacks[event] = callback),
          },
        },
      ],
    }).compileComponents();
  });

  it('shows free and occupied tables with their available actions', () => {
    const fixture = TestBed.createComponent(DiningRoomComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance.freeCount).toBe(1);
    expect(fixture.componentInstance.occupiedCount).toBe(1);
    expect(fixture.componentInstance.reservationCount).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Lista para cobrar');
    expect(fixture.nativeElement.textContent).toContain('Ana Pérez');
    expect(fixture.nativeElement.textContent).toContain('Confirmada');
    expect(fixture.nativeElement.textContent).toContain('Crear orden');
    expect(fixture.nativeElement.textContent).toContain('Ver orden');
  });

  it('refreshes the room when an order changes', () => {
    const fixture = TestBed.createComponent(DiningRoomComponent);
    fixture.detectChanges();

    realtimeCallbacks['order.updated']();

    expect(tables.overview).toHaveBeenCalledTimes(2);
  });

  it('refreshes the room when a reservation changes', () => {
    const fixture = TestBed.createComponent(DiningRoomComponent);
    fixture.detectChanges();

    realtimeCallbacks['reservation.updated']();

    expect(tables.overview).toHaveBeenCalledTimes(2);
  });

  it('keeps hosts in read-only mode', () => {
    role = 'host';
    const component = TestBed.createComponent(DiningRoomComponent).componentInstance;

    expect(component.canCreateOrder(freeTable)).toBeFalse();
    expect(component.canOpenOrder(occupiedTable)).toBeFalse();
  });

  it('lets administrators create a valid table', () => {
    role = 'admin';
    const component = TestBed.createComponent(DiningRoomComponent).componentInstance;
    component.form = { number: 8, capacity: 6, status: 'FREE' };

    component.saveTable();

    expect(tables.create).toHaveBeenCalledOnceWith({
      number: 8,
      capacity: 6,
      status: 'FREE',
    });
    expect(component.success).toBe('Mesa creada.');
  });

  it('does not allow editing an occupied table', () => {
    role = 'admin';
    const component = TestBed.createComponent(DiningRoomComponent).componentInstance;

    expect(component.canEditTable(occupiedTable)).toBeFalse();
  });

  it('keeps a table available for its active reservation', () => {
    role = 'admin';
    const component = TestBed.createComponent(DiningRoomComponent).componentInstance;
    component.tables = [freeTable];
    component.edit(freeTable);
    component.form.status = 'OUT_OF_SERVICE';

    component.saveTable();

    expect(tables.update).not.toHaveBeenCalled();
    expect(component.error).toContain('próxima reserva');
  });

  it('preserves the capacity needed by the active reservation', () => {
    role = 'admin';
    const component = TestBed.createComponent(DiningRoomComponent).componentInstance;
    component.tables = [freeTable];
    component.edit(freeTable);
    component.form.capacity = 3;

    component.saveTable();

    expect(tables.update).not.toHaveBeenCalled();
    expect(component.error).toContain('4 lugares');
  });
});
