import { computed, Injectable, signal } from '@angular/core';
import { AuthResponse } from '../models/dto/auth-response';
import { Role } from '../models/enums/role';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RegisterRequest } from '../models/dto/register-request';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../models/dto/api-response';
import { environment } from '../../../environments/environment';
import { LoginRequest } from '../models/dto/login-request';
import { UserResponse } from '../models/dto/user-response';



const TOKEN_KEY = 'jp_token';
const USER_KEY = 'jp_user';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = `${environment.apiUrl}/auth`;
  private currentUserSignal = signal<Partial<AuthResponse> | null> (this.loadStoredUser());
  currentUser = computed(() => this.currentUserSignal());
  isLoggedIn = computed(() => !!this.currentUserSignal());
  userRole = computed<Role | null>(() => (this.currentUserSignal()?.role as Role) ?? null);

  constructor(private http: HttpClient,private router:Router) { }

  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>>{
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/register`,request).pipe(tap(res => this.setSession(res.data!)));
  }

  login(request : LoginRequest):Observable<ApiResponse<AuthResponse>>{
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/login`,request).pipe(tap(res => this.setSession(res.data!)));
  }

  getProfile():Observable<ApiResponse<UserResponse>>{
    return this.http.get<ApiResponse<UserResponse>>(`${this.baseUrl}/profile`);
  }

  logout():void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): String | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private setSession(auth : AuthResponse): void{
    localStorage.setItem(TOKEN_KEY,auth.token);
    localStorage.setItem(USER_KEY,JSON.stringify(auth));
    this.currentUserSignal.set(auth);
  }

  private loadStoredUser(): Partial<AuthResponse> | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
