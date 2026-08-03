import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RealtimeService } from '../../core/services/realtime.service';
import { AuthService } from '../auth/auth.service';
import { InventoryComponent } from './inventory.component';
import { InventoryService } from './inventory.service';

describe('InventoryComponent role actions', () => {
  let inventory: jasmine.SpyObj<InventoryService>;

  beforeEach(async () => {
    inventory = jasmine.createSpyObj<InventoryService>('InventoryService', [
      'items',
      'lowStock',
      'create',
      'entry',
      'output',
    ]);
    inventory.items.and.returnValue(of([]));
    inventory.lowStock.and.returnValue(of([]));
    inventory.entry.and.returnValue(of({}));
    inventory.output.and.returnValue(of({}));
    await TestBed.configureTestingModule({
      imports: [InventoryComponent],
      providers: [
        { provide: InventoryService, useValue: inventory },
        { provide: AuthService, useValue: { user: () => ({ role: { name: 'kitchen' } }) } },
        { provide: RealtimeService, useValue: { on: () => undefined } },
      ],
    }).compileComponents();
  });

  it('limits kitchen users to inventory outputs', () => {
    const fixture = TestBed.createComponent(InventoryComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Nuevo insumo');
    expect(fixture.componentInstance.movement.type).toBe('output');
  });

  it('prevents kitchen users from submitting an inventory entry', () => {
    const component = TestBed.createComponent(InventoryComponent).componentInstance;
    component.ngOnInit();
    component.movement = { itemId: 'item-1', quantity: 2, note: '', type: 'entry' };

    component.move();

    expect(inventory.entry).not.toHaveBeenCalled();
    expect(inventory.output).toHaveBeenCalled();
  });
});
