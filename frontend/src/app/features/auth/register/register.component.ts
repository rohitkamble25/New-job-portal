import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {FormBuilder,FormGroup,Validators,ReactiveFormsModule} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { RegisterRequest } from '../../../core/models/dto/register-request';
import { Role } from '../../../core/models/enums/role';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  form: FormGroup;
  loading = false;
  showPassword = false;
  Role = Role;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
    }

    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: [''],
      role: [Role.JOBSEEKER, Validators.required]
    });
  }

  get name() {
    return this.form.get('name')!;
  }

  get email() {
    return this.form.get('email')!;
  }

  get password() {
    return this.form.get('password')!;
  }

  get role() {
    return this.form.get('role')!;
  }

  selectRole(role: Role): void {
  this.form.patchValue({ role });
}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const request: RegisterRequest = this.form.value;

    this.auth.register(request).subscribe({
      next: () => {
        this.toast.success('Account created! Welcome to JobPortal.');

        const userRole = this.auth.userRole();

        if (userRole === Role.EMPLOYER) {
          this.router.navigate(['/employer/dashboard']);
        } else {
          this.router.navigate(['/jobs']);
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}