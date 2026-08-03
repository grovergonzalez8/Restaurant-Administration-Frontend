import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Role } from '../../core/models/role.model';
import { User } from '../../core/models/user.model';
import { CreateStaffPayload, StaffService, UpdateStaffPayload } from './staff.service';
import { AuthService } from '../auth/auth.service';

const operationalRoles = new Set(['admin', 'kitchen', 'waiter', 'host']);

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.scss',
})
export class StaffComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  editingId: string | null = null;
  loading = true;
  saving = false;
  error = '';
  success = '';
  form = this.emptyForm();

  constructor(
    private readonly staff: StaffService,
    private readonly auth: AuthService,
  ) {}

  get activeUsers(): number {
    return this.users.filter((user) => user.isActive !== false).length;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    forkJoin({ users: this.staff.users(), roles: this.staff.roles() }).subscribe({
      next: ({ users, roles }) => {
        this.users = users ?? [];
        this.roles = (roles ?? []).filter((role) => operationalRoles.has(role.name.toLowerCase()));
        this.loading = false;
      },
      error: (response) => {
        this.loading = false;
        this.error = this.errorMessage(response, 'No se pudo cargar el personal.');
      },
    });
  }

  edit(user: User): void {
    this.editingId = user.id;
    this.error = '';
    this.success = '';
    this.form = {
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      password: '',
      roleId: user.role.id,
    };
  }

  cancelEdit(): void {
    this.editingId = null;
    this.form = this.emptyForm();
    this.error = '';
  }

  isCurrentUser(user: User): boolean {
    return this.auth.user()?.id === user.id;
  }

  toggleActive(user: User): void {
    if (this.isCurrentUser(user)) {
      this.error = 'No puedes desactivar tu propia cuenta.';
      return;
    }
    const nextState = user.isActive === false;
    const action = nextState ? 'reactivar' : 'desactivar';
    if (!window.confirm(`¿Confirmar que deseas ${action} a ${user.name}?`)) return;
    this.saving = true;
    this.error = '';
    this.success = '';
    this.staff.setActive(user.id, nextState).subscribe({
      next: () => {
        this.saving = false;
        this.success = nextState ? 'Cuenta reactivada correctamente.' : 'Cuenta desactivada correctamente.';
        this.load();
      },
      error: (response) => {
        this.saving = false;
        this.error = this.errorMessage(response, 'No se pudo actualizar el acceso.');
      },
    });
  }

  save(): void {
    if (!this.form.name.trim() || !this.form.email.trim() || this.form.roleId === null) {
      this.error = 'Completa nombre, correo y rol.';
      return;
    }
    if (!this.editingId && this.form.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';
    const common = {
      name: this.form.name.trim(),
      email: this.form.email.trim().toLowerCase(),
      phone: this.form.phone.trim() || undefined,
      roleId: this.form.roleId,
    };
    const request = this.editingId
      ? this.staff.update(this.editingId, {
          ...common,
          ...(this.form.password ? { password: this.form.password } : {}),
        } satisfies UpdateStaffPayload)
      : this.staff.create({
          ...common,
          password: this.form.password,
        } satisfies CreateStaffPayload);

    request.subscribe({
      next: () => {
        const wasEditing = Boolean(this.editingId);
        this.saving = false;
        this.editingId = null;
        this.form = this.emptyForm();
        this.success = wasEditing ? 'Personal actualizado correctamente.' : 'Personal creado correctamente.';
        this.load();
      },
      error: (response) => {
        this.saving = false;
        this.error = this.errorMessage(response, 'No se pudo guardar el personal.');
      },
    });
  }

  roleLabel(name: string): string {
    const labels: Record<string, string> = {
      admin: 'Administración',
      kitchen: 'Cocina',
      waiter: 'Mesero',
      host: 'Recepción',
    };
    return labels[name.toLowerCase()] ?? name;
  }

  private emptyForm() {
    return { name: '', email: '', phone: '', password: '', roleId: null as number | null };
  }

  private errorMessage(response: any, fallback: string): string {
    const message = response?.error?.message;
    return Array.isArray(message) ? message.join(' ') : message || fallback;
  }
}
