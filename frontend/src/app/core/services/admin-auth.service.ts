import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { AuthResponse } from '../models/dto/auth-response';
import { LoginRequest } from '../models/dto/login-request';
import { ApiResponse } from '../models/dto/api-response';
import { environment } from '../../../environments/environment';

const ADMIN_TOKEN_KEY = 'jp_admin_token';
const ADMIN_USER_KEY = 'jp_admin_user';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {

  private baseUrl = `${environment.apiUrl}/admin`;

  private currentAdminSignal = signal<Partial<AuthResponse> | null>(
    this.loadStoredAdmin()
  );

  currentAdmin = computed(() => this.currentAdminSignal());

  isLoggedIn = computed(() => !!this.currentAdminSignal());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.baseUrl}/login`, request)
      .pipe(
        tap(res => {
          const admin = res.data;

          if (!admin || String(admin.role).replace('ROLE_', '') !== 'ADMIN') {
            throw new Error('This login is only for admin accounts');
          }

          localStorage.setItem(ADMIN_TOKEN_KEY, admin.token);
          localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));

          this.currentAdminSignal.set(admin);
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    this.currentAdminSignal.set(null);
    this.router.navigate(['/admin/login']);
  }

  private loadStoredAdmin(): Partial<AuthResponse> | null {
    const raw = localStorage.getItem(ADMIN_USER_KEY);

    if (!raw) {
      return null;
    }

    try {
      const admin = JSON.parse(raw) as Partial<AuthResponse>;

      if (String(admin.role).replace('ROLE_', '') !== 'ADMIN') {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
        return null;
      }

      return admin;
    } catch {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
      return null;
    }
  }
}