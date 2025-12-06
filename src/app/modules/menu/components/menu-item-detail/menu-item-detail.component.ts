import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MenuService } from '../../menu.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-menu-item-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-item-detail.component.html',
  styleUrls: ['./menu-item-detail.component.scss'],
})
export class MenuItemDetailComponent implements OnInit {
  item: any = null;

  constructor(
    private route: ActivatedRoute, 
    private menuService: MenuService,
    private authService: AuthService,
    private router: Router   
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.menuService.get(id).subscribe((i) => (this.item = i));
  }

  hacerPedido() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/auth/login'],{
        queryParams: { redirectTo: `/menu/${this.item.id}` }
      });
      return;
    }
    console.log('Hacer pedido del item:', this.item);
  }
}
