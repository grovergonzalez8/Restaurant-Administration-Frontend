import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { MenuService } from '../../menu.service';
import { MenuItemDetailComponent } from './menu-item-detail.component';

describe('MenuItemDetailComponent', () => {
  let role = 'waiter';

  beforeEach(async () => {
    role = 'waiter';
    await TestBed.configureTestingModule({
      imports: [MenuItemDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'menu-1' } } },
        },
        {
          provide: MenuService,
          useValue: {
            get: () =>
              of({ id: 'menu-1', name: 'Silpancho', description: '', price: 25 }),
          },
        },
        { provide: AuthService, useValue: { user: () => ({ role: { name: role } }) } },
      ],
    }).compileComponents();
  });

  it('offers order creation to waiters', () => {
    const fixture = TestBed.createComponent(MenuItemDetailComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.btn-pedido')?.textContent).toContain(
      'Tomar pedido',
    );
  });

  it('hides order creation from kitchen users', () => {
    role = 'kitchen';
    const fixture = TestBed.createComponent(MenuItemDetailComponent);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.btn-pedido')).toBeNull();
  });
});
