import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { AuthService } from './modules/auth/auth.service';

describe('App', () => {
  let role = 'admin';

  beforeEach(async () => {
    role = 'admin';
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => true,
            user: () => ({ role: { name: role } }),
            logout: jasmine.createSpy('logout'),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('shows staff management only to administrators', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('nav').textContent).toContain('Personal');
  });

  it('shows only the host workspace links', () => {
    role = 'host';
    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();

    const navigation = fixture.nativeElement.querySelector('nav').textContent;
    expect(navigation).toContain('Reservas');
    expect(navigation).toContain('Menú');
    expect(navigation).not.toContain('Inventario');
    expect(navigation).not.toContain('Órdenes');
    expect(navigation).not.toContain('Caja');
  });

  it('lets waiters access reservations for the order handoff', () => {
    role = 'waiter';
    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();

    const navigation = fixture.nativeElement.querySelector('nav').textContent;
    expect(navigation).toContain('Reservas');
    expect(navigation).toContain('Órdenes');
  });
});
