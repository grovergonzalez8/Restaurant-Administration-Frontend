import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Reservation } from '../../core/models/reservation.model';
import { ReservationsComponent } from './reservations.component';
import { ReservationsService } from './reservations.service';

describe('ReservationsComponent', () => {
  const pending: Reservation = {
    id: 'reservation-1',
    tableId: 'table-1',
    customerName: 'Ana Pérez',
    phone: '70000000',
    guests: 4,
    reservationAt: '2099-08-03T20:00:00.000Z',
    status: 'PENDING',
    table: { id: 'table-1', number: 4 },
  };
  let service: jasmine.SpyObj<ReservationsService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<ReservationsService>('ReservationsService', [
      'upcoming',
      'availability',
      'create',
      'status',
    ]);
    service.upcoming.and.returnValue(of([pending]));
    service.availability.and.returnValue(of([{ id: 'table-1', number: 4 }]));
    service.create.and.returnValue(of(pending));
    service.status.and.returnValue(of({ ...pending, status: 'CONFIRMED' }));

    await TestBed.configureTestingModule({
      imports: [ReservationsComponent],
      providers: [{ provide: ReservationsService, useValue: service }],
    }).compileComponents();
  });

  it('checks availability using an unambiguous ISO timestamp', () => {
    const component = TestBed.createComponent(ReservationsComponent).componentInstance;
    component.form.guests = 4;
    component.form.reservationAt = '2099-08-03T20:00';

    component.checkAvailability();

    expect(service.availability).toHaveBeenCalledOnceWith({
      reservationAt: new Date('2099-08-03T20:00').toISOString(),
      guests: 4,
    });
    expect(component.tables).toEqual([{ id: 'table-1', number: 4 }]);
    expect(component.availabilityChecked).toBeTrue();
  });

  it('creates a normalized reservation only after selecting an available table', () => {
    const component = TestBed.createComponent(ReservationsComponent).componentInstance;
    component.form = {
      tableId: 'table-1',
      customerName: ' Ana Pérez ',
      phone: ' 70000000 ',
      email: '',
      guests: 4,
      reservationAt: '2099-08-03T20:00',
      note: ' Cumpleaños ',
    };
    component.availabilityChecked = true;

    component.create();

    expect(service.create).toHaveBeenCalledOnceWith({
      tableId: 'table-1',
      customerName: 'Ana Pérez',
      phone: '70000000',
      email: undefined,
      guests: 4,
      reservationAt: new Date('2099-08-03T20:00').toISOString(),
      note: 'Cumpleaños',
    });
  });

  it('offers only valid actions for each reservation state', () => {
    const component = TestBed.createComponent(ReservationsComponent).componentInstance;

    expect(component.actions(pending).map((action) => action.status)).toEqual([
      'CONFIRMED',
      'CANCELLED',
    ]);
    expect(
      component
        .actions({ ...pending, status: 'CONFIRMED' })
        .map((action) => action.status),
    ).toEqual(['COMPLETED', 'CANCELLED']);
  });

  it('requires confirmation before cancelling a reservation', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const component = TestBed.createComponent(ReservationsComponent).componentInstance;

    component.updateStatus(pending, { status: 'CANCELLED', label: 'Cancelar' });

    expect(service.status).not.toHaveBeenCalled();
  });
});
