import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MenuService } from '../../menu.service';
import { MenuItem } from '../../../../core/models/menu-item.model';
import '@google/model-viewer';
import { AuthService } from '../../../auth/auth.service';
import { normalizeRole } from '../../../auth/role-access';

@Component({
  selector: 'app-menu-item-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './menu-item-detail.component.html',
  styleUrls: ['./menu-item-detail.component.scss'],
})
export class MenuItemDetailComponent implements OnInit {
  item: MenuItem | null = null;

  constructor(
    private route: ActivatedRoute, 
    private menuService: MenuService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.menuService.get(id).subscribe((i) => (this.item = i));
  }

  canCreateOrder(): boolean {
    const role = normalizeRole(this.auth.user()?.role?.name);
    return role === 'admin' || role === 'waiter';
  }

  get hasArModel(): boolean {
    return Boolean(this.item?.model3dUrl);
  }
}
