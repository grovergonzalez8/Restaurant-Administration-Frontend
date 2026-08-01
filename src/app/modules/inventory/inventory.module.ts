import { CommonModule } from "@angular/common";
import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { inventoryRoutes } from "./inventory.routes";

export const inventoryConfig: ApplicationConfig = {
    providers: [
        importProvidersFrom([
            CommonModule,
            ReactiveFormsModule,
            RouterModule.forChild(inventoryRoutes),
        ])
    ]
};