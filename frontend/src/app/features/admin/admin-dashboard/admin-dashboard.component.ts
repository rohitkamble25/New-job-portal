import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../../core/services/company.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { CompanyResponse } from '../../../core/models/dto/company-response';
import { UserResponse } from '../../../core/models/dto/user-response'; 
import { Role } from '../../../core/models/enums/role';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/dto/api-response';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LoaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  activeTab: 'companies' | 'users' = 'companies';

  companies: CompanyResponse[] = [];
  companiesLoading = true;
  approvingId: number | null = null;

  users: UserResponse[] = [];
  usersLoading = false;
  togglingId: number | null = null;
  userSearch = '';

  Role = Role;

  constructor(
    private companyService: CompanyService,
    private toast: ToastService,
    private http: HttpClient,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
  this.loadAllCompanies();
  this.loadUsers();
}

  switchTab(tab: 'companies' | 'users'): void {
    this.activeTab = tab;
    if (tab === 'users' && this.users.length === 0) {
      this.loadUsers();
    }
  }
loadAllCompanies(): void {
  this.companiesLoading = true;

  this.http.get<ApiResponse<CompanyResponse[]>>(
    `${environment.apiUrl}/admin/companies`
  ).subscribe({
    next: res => {
      this.companies = res.data ?? [];
      this.companiesLoading = false;
    },
    error: err => {
      console.error('Failed to load admin companies:', err);
      this.companiesLoading = false;
      this.toast.error('Failed to load companies');
    }
  });
}
  get pendingCompanies(): CompanyResponse[] {
    return this.companies.filter(c => !c.isApproved);
  }

  get approvedCompanies(): CompanyResponse[] {
    return this.companies.filter(c => c.isApproved);
  }

  approveCompany(company: CompanyResponse): void {
    this.approvingId = company.id;

    this.http.patch<ApiResponse<CompanyResponse>>(
      `${environment.apiUrl}/admin/companies/${company.id}/approve`,
      {}
    ).subscribe({
      next: res => {
        const idx = this.companies.findIndex(c => c.id === company.id);


      if (idx !== -1 && res.data) {
        this.companies[idx] = res.data;
      }

        this.toast.success(`${company.name} approved successfully`);
        this.approvingId = null;
      },
      error: () => {
        this.approvingId = null;
      }
    });
  }

  loadUsers(): void {
    this.usersLoading = true;

    this.http.get<ApiResponse<UserResponse[]>>(
      `${environment.apiUrl}/admin/users`
    ).subscribe({
      next: res => {
        this.users = res.data ?? [];
        this.usersLoading = false;
      },
      error: () => {
        this.usersLoading = false;
      }
    });
  }

  get filteredUsers(): UserResponse[] {
    if (!this.userSearch.trim()) {
      return this.users;
    }

    const q = this.userSearch.toLowerCase();

    return this.users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }
  logout(): void {
  this.auth.logout();
}

  get totalSeekers(): number {
    return this.users.filter(u => u.role === Role.JOBSEEKER).length;
  }

  get totalEmployers(): number {
    return this.users.filter(u => u.role === Role.EMPLOYER).length;
  }

  toggleUser(user: UserResponse): void {
    if (!confirm(
      `${user.isActive ? 'Deactivate' : 'Activate'} ${user.name}?`
    )) {
      return;
    }

    this.togglingId = user.id;

    this.http.patch<ApiResponse<void>>(
      `${environment.apiUrl}/admin/users/${user.id}/toggle`,
      {}
    ).subscribe({
      next: () => {
        const idx = this.users.findIndex(u => u.id === user.id);

        if (idx !== -1) {
          this.users[idx] = {
            ...this.users[idx],
            isActive: !this.users[idx].isActive
          };
        }

        this.toast.success(
          `${user.name} ${user.isActive ? 'deactivated' : 'activated'}`
        );

        this.togglingId = null;
      },
      error: () => {
        this.togglingId = null;
      }
    });
  }

  roleLabel(role: Role): string {
    if (role === Role.JOBSEEKER) return 'Job Seeker';
    if (role === Role.EMPLOYER) return 'Employer';
    return 'Admin';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map(p => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}