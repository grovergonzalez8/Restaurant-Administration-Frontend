import { MenuStatus } from '../enums/menu-status.enum';

export interface MenuItem {
  id?: string;
  name: string;
  description?: string;
  price: number;
  status: MenuStatus;
  createdAt?: string;
  updatedAt?: string;
}
