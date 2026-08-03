import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { OrderStatus } from '../../core/enums/order-status.enum';
import { KitchenTicket } from '../../core/models/kitchen-ticket.model';
import { RealtimeService } from '../../core/services/realtime.service';
import { KitchenComponent } from './kitchen.component';
import { KitchenService } from './kitchen.service';

describe('KitchenComponent', () => {
  const pendingTicket: KitchenTicket = {
    id: 'ticket-1',
    status: 'pending',
    order: {
      id: 'order-1',
      status: OrderStatus.PENDING,
      table: { id: 'table-1', number: 4 },
      items: [{
        id: 'item-1',
        menuItem: { id: 'menu-1', name: 'Hamburguesa' },
        quantity: 2,
        unitPrice: 10,
        subtotal: 20,
      }],
      total: 20,
    },
    createdAt: '2026-08-02T10:00:00.000Z',
    updatedAt: '2026-08-02T10:00:00.000Z',
  };
  let service: jasmine.SpyObj<KitchenService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<KitchenService>('KitchenService', ['active', 'updateStatus']);
    service.active.and.returnValue(of([pendingTicket]));
    service.updateStatus.and.returnValue(of({
      ...pendingTicket,
      status: 'in_progress',
      order: { ...pendingTicket.order, status: OrderStatus.IN_PROGRESS },
    }));

    await TestBed.configureTestingModule({
      imports: [KitchenComponent],
      providers: [
        { provide: KitchenService, useValue: service },
        { provide: RealtimeService, useValue: { on: () => undefined } },
      ],
    }).compileComponents();
  });

  it('loads and separates pending tickets', () => {
    const fixture = TestBed.createComponent(KitchenComponent);
    fixture.detectChanges();

    expect(service.active).toHaveBeenCalled();
    expect(fixture.componentInstance.pending).toEqual([pendingTicket]);
    expect(fixture.componentInstance.inProgress).toEqual([]);
  });

  it('starts a pending ticket with the valid next status', () => {
    const component = TestBed.createComponent(KitchenComponent).componentInstance;
    component.tickets = [pendingTicket];

    component.advance(pendingTicket);

    expect(service.updateStatus).toHaveBeenCalledWith('ticket-1', 'in_progress');
    expect(component.inProgress.length).toBe(1);
  });

  it('marks an in-progress ticket ready and removes it from the active board', () => {
    const workingTicket: KitchenTicket = { ...pendingTicket, status: 'in_progress' };
    service.updateStatus.and.returnValue(of({ ...workingTicket, status: 'ready' }));
    const component = TestBed.createComponent(KitchenComponent).componentInstance;
    component.tickets = [workingTicket];

    component.advance(workingTicket);

    expect(service.updateStatus).toHaveBeenCalledWith('ticket-1', 'ready');
    expect(component.tickets).toEqual([]);
    expect(component.success).toContain('lista para entregar y cobrar');
  });

  it('requires confirmation before cancelling a ticket', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const component = TestBed.createComponent(KitchenComponent).componentInstance;

    component.cancel(pendingTicket);

    expect(service.updateStatus).not.toHaveBeenCalled();
  });
});
