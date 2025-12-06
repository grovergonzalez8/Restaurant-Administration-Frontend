import { CommonModule } from "@angular/common";
import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { authRoutes } from "./auth.routes";

export const authConfig: ApplicationConfig = {
    providers: [
        importProvidersFrom([
            CommonModule,
            ReactiveFormsModule,
            RouterModule.forChild(authRoutes),
        ])
    ],
};