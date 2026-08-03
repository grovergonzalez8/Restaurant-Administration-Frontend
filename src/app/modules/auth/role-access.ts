export type StaffRole = 'admin' | 'kitchen' | 'waiter' | 'host' | 'customer';

const roleAliases: Record<string, StaffRole> = {
  admin: 'admin',
  kitchen: 'kitchen',
  cocina: 'kitchen',
  waiter: 'waiter',
  mesero: 'waiter',
  host: 'host',
  anfitrion: 'host',
  customer: 'customer',
  cliente: 'customer',
};

export function normalizeRole(name?: string | null): StaffRole | null {
  return roleAliases[name?.trim().toLowerCase() ?? ''] ?? null;
}

export function defaultRouteForRole(name?: string | null): string {
  switch (normalizeRole(name)) {
    case 'admin':
      return '/dashboard';
    case 'kitchen':
      return '/kitchen';
    case 'waiter':
      return '/orders';
    case 'host':
      return '/reservations';
    default:
      return '/menu';
  }
}
