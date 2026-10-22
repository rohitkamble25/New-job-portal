import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AdminAuthService } from '../services/admin-auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const adminAuth = inject(AdminAuthService);

  const isAdminApi = req.url.includes('/api/admin/');
  const isPublicAuthApi =
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/register') ||
    req.url.includes('/api/admin/login') ||
    req.url.includes('/api/admin/register');

  if (isPublicAuthApi) {
    return next(req);
  }

  const token = isAdminApi
    ? adminAuth.getToken()
    : auth.getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(cloned);
  }

  return next(req);
};
