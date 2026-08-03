import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { StaffComponent } from './staff.component';
import { StaffService } from './staff.service';

describe('StaffComponent', () => {
  const roles = [
    { id: 1, name: 'admin' },
    { id: 2, name: 'kitchen' },
    { id: 3, name: 'waiter' },
    { id: 4, name: 'host' },
    { id: 5, name: 'customer' },
  ];
  const user = {
    id: 'user-1',
    name: 'Ana Pérez',
    email: 'ana@example.com',
    phone: '70000000',
    isActive: true,
    role: roles[2],
  };
  let service: jasmine.SpyObj<StaffService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<StaffService>('StaffService', [
      'users',
      'roles',
      'create',
      'update',
      'setActive',
    ]);
    service.users.and.returnValue(of([user]));
    service.roles.and.returnValue(of(roles));
    service.create.and.returnValue(of(user));
    service.update.and.returnValue(of(user));
    service.setActive.and.returnValue(of({ ...user, isActive: false }));

    await TestBed.configureTestingModule({
      imports: [StaffComponent],
      providers: [
        { provide: StaffService, useValue: service },
        { provide: AuthService, useValue: { user: () => ({ id: 'admin-1' }) } },
      ],
    }).compileComponents();
  });

  it('deactivates another staff account after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const component = TestBed.createComponent(StaffComponent).componentInstance;

    component.toggleActive(user);

    expect(service.setActive).toHaveBeenCalledOnceWith('user-1', false);
  });

  it('loads staff and hides the customer role from assignment', () => {
    const fixture = TestBed.createComponent(StaffComponent);
    fixture.detectChanges();

    expect(service.users).toHaveBeenCalled();
    expect(fixture.componentInstance.roles.map((role) => role.name)).toEqual([
      'admin',
      'kitchen',
      'waiter',
      'host',
    ]);
    expect(fixture.nativeElement.textContent).toContain('Ana Pérez');
  });

  it('creates staff with normalized form data', () => {
    const component = TestBed.createComponent(StaffComponent).componentInstance;
    component.form = {
      name: ' Ana Pérez ',
      email: ' ANA@EXAMPLE.COM ',
      phone: '',
      password: 'secret1',
      roleId: 3,
    };

    component.save();

    expect(service.create).toHaveBeenCalledWith({
      name: 'Ana Pérez',
      email: 'ana@example.com',
      phone: undefined,
      password: 'secret1',
      roleId: 3,
    });
  });

  it('updates staff without changing an empty password', () => {
    const component = TestBed.createComponent(StaffComponent).componentInstance;
    component.edit(user);

    component.save();

    expect(service.update).toHaveBeenCalledWith('user-1', {
      name: 'Ana Pérez',
      email: 'ana@example.com',
      phone: '70000000',
      roleId: 3,
    });
  });
});
