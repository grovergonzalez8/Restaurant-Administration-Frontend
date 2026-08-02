import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MenuService } from '../../menu.service';
import { MenuItem } from '../../../../core/models/menu-item.model';
import '@google/model-viewer';

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
    private router: Router   
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.menuService.get(id).subscribe((i) => (this.item = i));
  }

  hacerPedido() {
    if (!this.item) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/auth/login'],{
        queryParams: { redirectTo: `/menu/${this.item.id}` }
      });
      return;
    }
    console.log('Hacer pedido del item:', this.item);
  }

  get hasArModel(): boolean {
    return Boolean(this.item?.model3dUrl);
  }
}
