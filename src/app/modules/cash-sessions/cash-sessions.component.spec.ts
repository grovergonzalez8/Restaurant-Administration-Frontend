import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CashSessionsComponent } from './cash-sessions.component';
import { CashSessionsService } from './cash-sessions.service';
import { RealtimeService } from '../../core/services/realtime.service';

describe('CashSessionsComponent', () => {
  const session = {
    id: 'cash-1',
    openedBy: { id: 'user-1', name: 'Ana' },
    openingBalance: 100,
    status: 'OPEN' as const,
    openedAt: '2026-08-02T10:00:00.000Z',
  };
  const summary = {
    sessionId: 'cash-1',
    status: 'OPEN' as const,
    payments: 2,
    byMethod: { CASH: 50, CARD: 20, QR: 10 },
    totalSales: 80,
    expectedCash: 150,
  };
  let service: jasmine.SpyObj<CashSessionsService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<CashSessionsService>('CashSessionsService', [
      'current', 'list', 'open', 'summary', 'close',
    ]);
    service.current.and.returnValue(of(null));
    service.list.and.returnValue(of([]));
    service.open.and.returnValue(of(session));
    service.summary.and.returnValue(of(summary));
    service.close.and.returnValue(of({
      ...session,
      status: 'CLOSED',
      expectedBalance: 150,
      closingBalance: 145,
      difference: -5,
      closedAt: '2026-08-02T18:00:00.000Z',
    }));

    await TestBed.configureTestingModule({
      imports: [CashSessionsComponent],
      providers: [
        { provide: CashSessionsService, useValue: service },
        { provide: AuthService, useValue: { user: () => ({ role: { name: 'waiter' } }) } },
        { provide: RealtimeService, useValue: { on: () => undefined } },
      ],
    }).compileComponents();
  });

  it('opens a shift and loads its summary', () => {
    const component = TestBed.createComponent(CashSessionsComponent).componentInstance;
    component.openingBalance = 100;

    component.open();

    expect(service.open).toHaveBeenCalledWith(100);
    expect(service.summary).toHaveBeenCalledWith('cash-1');
    expect(component.currentSession).toEqual(session);
    expect(component.summary).toEqual(summary);
  });

  it('closes the current shift and keeps the reconciliation result', () => {
    const component = TestBed.createComponent(CashSessionsComponent).componentInstance;
    component.currentSession = session;
    component.closingBalance = 145;

    component.close();

    expect(service.close).toHaveBeenCalledWith('cash-1', 145);
    expect(component.currentSession).toBeNull();
    expect(component.lastClosed?.difference).toBe(-5);
  });

  it('rejects negative opening balances before calling the API', () => {
    const component = TestBed.createComponent(CashSessionsComponent).componentInstance;
    component.openingBalance = -1;

    component.open();

    expect(service.open).not.toHaveBeenCalled();
    expect(component.error).toContain('saldo inicial válido');
  });
});
