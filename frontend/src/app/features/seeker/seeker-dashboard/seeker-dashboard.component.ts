import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ApplicationResponse } from '../../../core/models/dto/application-response';
import { ApplicationStatus } from '../../../core/models/enums/application-status';

@Component({
  selector: 'app-seeker-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatusBadgeComponent,
    EmptyStateComponent,
    LoaderComponent
  ],
  templateUrl: './seeker-dashboard.component.html',
  styleUrl: './seeker-dashboard.component.scss'
})
export class SeekerDashboardComponent {

  applications: ApplicationResponse[] = [];
  loading = true;
  withdrawingId: number | null = null;
  ApplicationStatus = ApplicationStatus;

  constructor(
    private applicationService: ApplicationService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.applicationService.getMyApplications().subscribe({
      next: res => {
        this.applications = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get pending(): ApplicationResponse[] {
    return this.applications.filter(
      a => a.status === ApplicationStatus.PENDING
    );
  }

  get active(): ApplicationResponse[] {
    return this.applications.filter(
      a => [
        ApplicationStatus.REVIEWED,
        ApplicationStatus.SHORTLISTED
      ].includes(a.status)
    );
  }

  get closed(): ApplicationResponse[] {
    return this.applications.filter(
      a => [
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED
      ].includes(a.status)
    );
  }

  withdraw(app: ApplicationResponse): void {
    if (!confirm(`Withdraw application for "${app.jobTitle}"?`)) {
      return;
    }

    this.withdrawingId = app.id;

    this.applicationService.withdrawApplication(app.id).subscribe({
      next: () => {
        this.applications = this.applications.filter(
          a => a.id !== app.id
        );

        this.toast.success('Application withdrawn');
        this.withdrawingId = null;
      },
      error: () => {
        this.withdrawingId = null;
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  get userName(): string {
    return this.auth.currentUser()?.name ?? '';
  }
}