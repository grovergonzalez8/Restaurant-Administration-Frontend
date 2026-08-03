import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { defaultRouteForRole } from '../role-access';

@Component({
  selector: 'app-login.component',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  loginError: string | null = null;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  submit() {

    if(this.form.invalid) return;

    const { email, password } = this.form.value;
    if (!email || !password) return;
    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.loginError = null;
        const requestedUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const redirectTo = requestedUrl?.startsWith('/') && !requestedUrl.startsWith('//')
          ? requestedUrl
          : defaultRouteForRole(this.authService.user()?.role?.name);
        this.router.navigateByUrl(redirectTo);
      },
      error: () => {
        this.loginError = 'Correo o contraseña incorrectos';
      },
    })
  }

  get f() {
    return this.form.controls;
  }
}
