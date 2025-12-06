import { MenuListComponent } from './components/menu-list/menu-list.component';
import { MenuItemDetailComponent } from './components/menu-item-detail/menu-item-detail.component';

export const menuRoutes = [
  { path: 'menu', component: MenuListComponent },
  { path: 'menu/:id', component: MenuItemDetailComponent },
];
