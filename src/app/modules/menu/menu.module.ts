import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuListComponent } from './components/menu-list/menu-list.component';
import { MenuItemDetailComponent } from './components/menu-item-detail/menu-item-detail.component';

@NgModule({
  imports: [CommonModule, RouterModule, MenuListComponent, MenuItemDetailComponent],
})
export class MenuModule {}
