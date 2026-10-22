import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../../core/services/application.service';
import { JobService } from '../../../core/services/job.service';
import { ToastService } from '../../../core/services/toast.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ApplicationResponse } from '../../../core/models/dto/application-response';
import { ApplicationStatus, STATUS_LABELS } from '../../../core/models/enums/application-status';
import { JobResponse } from '../../../core/models/dto/job-response';

@Component({
  selector: 'app-applicants-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    StatusBadgeComponent,
    LoaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './applicants-list.component.html',
  styleUrl: './applicants-list.component.scss'
})
export class ApplicantsListComponent implements OnInit {
  applications: ApplicationResponse[] = [];
  job: JobResponse | null = null;
  loading = true;
  updatingId: number | null = null;

  showModal = false;
  selectedApp: ApplicationResponse | null = null;
  selectedStatus: ApplicationStatus = ApplicationStatus.PENDING;
  notes = '';

  ApplicationStatus = ApplicationStatus;
  statusLabels = STATUS_LABELS;
  allStatuses = Object.values(ApplicationStatus);

  filterStatus: ApplicationStatus | '' = '';

  constructor(
    private applicationService: ApplicationService,
    private jobService: JobService,
    private toast: ToastService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const jobId = Number(this.route.snapshot.paramMap.get('jobId'));
    this.loadJob(jobId);
    this.loadApplications(jobId);
  }

  loadJob(jobId: number): void {
    this.jobService.getJobById(jobId).subscribe({
      next: res => {
        this.job = res.data;
      },
      error: () => {
  this.loading = false;
  this.toast.error('Failed to load applicants. Please try again.');
}
    });
  }

  loadApplications(jobId: number): void {
    this.applicationService.getApplicationsForJob(jobId).subscribe({
      next: res => {
        this.applications = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredApplications(): ApplicationResponse[] {
    if (!this.filterStatus) {
      return this.applications;
    }

    return this.applications.filter(
      a => a.status === this.filterStatus
    );
  }

  countByStatus(status: ApplicationStatus): number {
    return this.applications.filter(
      a => a.status === status
    ).length;
  }

  openStatusModal(app: ApplicationResponse): void {
    this.selectedApp = app;
    this.selectedStatus = app.status;
    this.notes = app.employerNotes ?? '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedApp = null;
    this.notes = '';
  }

  updateStatus(): void {
    if (!this.selectedApp) {
      return;
    }

    this.updatingId = this.selectedApp.id;

  
    this.applicationService.updateStatus(
      this.selectedApp.id,
      this.selectedStatus,
      this.notes || undefined
    ).subscribe({
      next: res => {
        if (res.data) {
          const idx = this.applications.findIndex(
            a => a.id === this.selectedApp!.id
          );

          if (idx !== -1) {
            this.applications[idx] = res.data;
          }
        }

        this.toast.success('Application status updated');
        this.closeModal();
        this.updatingId = null;
      },
      error: () => {
        this.updatingId = null;
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
}