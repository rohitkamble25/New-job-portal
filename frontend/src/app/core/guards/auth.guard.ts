import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { routes } from '../../app.routes';

export const authGuard: CanActivateFn = () => {

  const auth = inject(AuthService);
  const router = inject(Router);

  if(auth.isLoggedIn()){
    return true;
  }
  router.navigate(['/login']);
  return false;
  
};
