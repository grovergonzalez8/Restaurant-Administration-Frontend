import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { InventoryService } from '../inventory/inventory.service';
import { MenuService } from '../menu/menu.service';
import { RecipesComponent } from './recipes.component';
import { RecipesService } from './recipes.service';

describe('RecipesComponent role actions', () => {
  let recipes: jasmine.SpyObj<RecipesService>;

  beforeEach(async () => {
    recipes = jasmine.createSpyObj<RecipesService>('RecipesService', ['all', 'create', 'remove']);
    recipes.all.and.returnValue(
      of([
        {
          id: 'recipe-1',
          quantity: 1,
          menuItem: { id: 'menu-1', name: 'Silpancho' },
          inventoryItem: { id: 'item-1', name: 'Carne', unit: 'kg' },
        },
      ]),
    );
    recipes.create.and.returnValue(
      of({
        id: 'recipe-1',
        quantity: 1,
        menuItem: { id: 'menu-1', name: 'Silpancho' },
        inventoryItem: { id: 'item-1', name: 'Carne', unit: 'kg' },
      }),
    );
    recipes.remove.and.returnValue(of(void 0));
    await TestBed.configureTestingModule({
      imports: [RecipesComponent],
      providers: [
        { provide: RecipesService, useValue: recipes },
        { provide: MenuService, useValue: { list: () => of([]) } },
        { provide: InventoryService, useValue: { items: () => of([]) } },
        { provide: AuthService, useValue: { user: () => ({ role: { name: 'kitchen' } }) } },
      ],
    }).compileComponents();
  });

  it('shows recipes read-only to kitchen users', () => {
    const fixture = TestBed.createComponent(RecipesComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(fixture.nativeElement.querySelector('article button')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Silpancho');
  });

  it('blocks recipe mutations outside the admin role', () => {
    const component = TestBed.createComponent(RecipesComponent).componentInstance;

    component.create();
    component.remove('recipe-1');

    expect(recipes.create).not.toHaveBeenCalled();
    expect(recipes.remove).not.toHaveBeenCalled();
  });
});
