import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule,Router } from '@angular/router';
import { FormBuilder,FormGroup,Validators,ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Role } from '../../../core/models/enums/role';
import { LoginRequest } from '../../../core/models/dto/login-request';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,RouterModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ){
    if(this.auth.isLoggedIn()){
      this.redirectByRole();
    }

    this.form = this.fb.group({
      email:['',[Validators.required,Validators.email]],
      password:['',[Validators.required,Validators.minLength(6)]]
    });
  }
  get email(){return this.form.get('email')!;}
  get password(){return this.form.get('password')!;}

  onSubmit(): void{
    if(this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const request:LoginRequest = this.form.value;

    this.auth.login(request).subscribe({
      next:()=>{
        this.toast.success('Welcome back!');
        this.redirectByRole();
      },
      error:() =>{
        this.loading = false;
      }
    });
  }

  private redirectByRole(): void {
    const role = this.auth.userRole();
    if (role === Role.EMPLOYER) this.router.navigate(['/employer/dashboard']);
    else if (role === Role.ADMIN) this.router.navigate(['/admin']);
    else this.router.navigate(['/jobs']);
  }


}
