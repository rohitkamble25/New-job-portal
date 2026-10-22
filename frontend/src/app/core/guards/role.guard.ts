import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Role } from '../models/enums/role';
import { AuthService } from '../services/auth.service';
import { AdminAuthService } from '../services/admin-auth.service';

export function roleGuard(allowedRoles: Role[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const adminAuth = inject(AdminAuthService);
    const router = inject(Router);

    if (allowedRoles.includes(Role.ADMIN)) {
      const admin = adminAuth.currentAdmin();

      if (adminAuth.isLoggedIn() && admin?.role &&
          String(admin.role).replace('ROLE_', '') === 'ADMIN') {
        return true;
      }

      router.navigate(['/admin/login']);
      return false;
    }

    if (!auth.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }

    const role = auth.userRole();

    if (role && allowedRoles.includes(role)) {
      return true;
    }

    router.navigate(['/']);
    return false;
  };
}
