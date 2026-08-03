import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: Router, useValue: router },
        {
          provide: AuthService,
          useValue: {
            login: () => of({}),
            user: () => ({ role: { name: 'waiter' } }),
          },
        },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
      ],
    }).compileComponents();
  });

  it('renders labelled controls with the expected autocomplete hints', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const email = fixture.nativeElement.querySelector('#email') as HTMLInputElement;
    const password = fixture.nativeElement.querySelector('#password') as HTMLInputElement;
    expect(email.labels?.[0].textContent).toContain('Correo electrónico');
    expect(email.autocomplete).toBe('email');
    expect(password.labels?.[0].textContent).toContain('Contraseña');
    expect(password.autocomplete).toBe('current-password');
  });

  it('redirects a waiter to the orders workspace after login', () => {
    const component = TestBed.createComponent(LoginComponent).componentInstance;
    component.form.setValue({ email: 'waiter@restaurant.test', password: 'secret' });

    component.submit();

    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/orders');
  });
});
