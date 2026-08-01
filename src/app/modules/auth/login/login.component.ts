import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';

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
    const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') || '/menu';

    if (!email || !password) return;
    this.authService.login({ email, password }).subscribe({
      next: (resp) => {
        console.log('Respuesta del Login => ', resp);
        this.loginError = null;
        this.router.navigateByUrl(redirectTo);
      },
      error: (err) => {
        console.error('Login fallido', err)
        this.loginError = 'Correo o Contraseña inconrrectos';
      },
    })
  }

  get f() {
    return this.form.controls;
  }
}
