import { Routes } from "@angular/router";
import { ItemsListComponent } from "./components/items-list.component/items-list.component";
import { ItemDetailComponent } from "./components/item-detail.component/item-detail.component";
import { EntriesListComponent } from "./components/entries-list.component/entries-list.component";
import { OutputsListComponent } from "./components/outputs-list.component/outputs-list.component";

export const inventoryRoutes: Routes = [
    { path: 'inventory', component: ItemsListComponent },
    { path: 'inventory/create', component: ItemDetailComponent }, 
    { path: 'inventory/:id', component: ItemDetailComponent },
    { path: 'inventory/entries', component: EntriesListComponent },
    { path: 'inventory/outputs', component: OutputsListComponent },
]