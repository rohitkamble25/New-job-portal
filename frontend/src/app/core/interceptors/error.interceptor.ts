import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';
import { AdminAuthService } from '../services/admin-auth.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);
  const adminAuth = inject(AdminAuthService);

  const isAdminApi = req.url.includes('/api/admin/');
  const isPublicAuthApi =
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/register') ||
    req.url.includes('/api/admin/login') ||
    req.url.includes('/api/admin/register');

  return next(req).pipe(
    catchError(error => {
      const message =
        error?.error?.message || 'Something went wrong. Please try again.';

      if (error.status === 401) {
        if (isPublicAuthApi) {
          toast.error(message);
        } else {
          toast.error('Session expired. Please log in again.');

          if (isAdminApi) {
            adminAuth.logout();
          } else {
            auth.logout();
          }
        }
      } else if (error.status === 403) {
        toast.error("You don't have permission to do that.");
      } else if (error.status === 404) {
        toast.error(message);
      } else if (error.status === 0) {
        toast.error('Cannot reach the server. Is the backend running?');
      } else {
        toast.error(message);
      }

      return throwError(() => error);
    })
  );
};
