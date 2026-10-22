import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../../core/services/job.service';
import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { JobResponse } from '../../../core/models/dto/job-response';
import { JOB_TYPE_LABELS, JobType } from '../../../core/models/enums/job-type';
import { Role } from '../../../core/models/enums/role';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LoaderComponent
  ],
  templateUrl: './job-detail.component.html',
  styleUrl: './job-detail.component.scss'
})
export class JobDetailComponent implements OnInit {

  job: JobResponse | null = null;
  loading = true;
  deleting = false;
  applying = false;

 showApplyModal = false;
  coverLetter = '';

  Role = Role;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private applicationService: ApplicationService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.jobService.getJobById(id).subscribe({
      next: res => {
        this.job = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/jobs']);
      }
    });
  }

  get jobTypeLabel(): string {
    if (!this.job) return '';

    return JOB_TYPE_LABELS[this.job.jobType as JobType] ?? this.job.jobType;
  }

  get skillList(): string[] {
    return this.job?.skills
      ? this.job.skills
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      : [];
  }

  get isOwner(): boolean {
    return this.auth.currentUser()?.name === this.job?.postedByName
      && this.auth.userRole() === Role.EMPLOYER;
  }

  get isJobSeeker(): boolean {
    return this.auth.userRole() === Role.JOBSEEKER;
  }

  get daysAgo(): string {
    if (!this.job) return '';

    const days = Math.floor(
      (Date.now() - new Date(this.job.createdAt).getTime())
      / (1000 * 60 * 60 * 24)
    );

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';

    return `${days} days ago`;
  }

  formatSalary(): string {
    if (!this.job) return '';

    if (!this.job.salaryMin && !this.job.salaryMax) {
      return 'Not disclosed';
    }

    const fmt = (n: number) =>
      '₹' + new Intl.NumberFormat('en-IN').format(n);

    if (this.job.salaryMin && this.job.salaryMax) {
      return `${fmt(this.job.salaryMin)} – ${fmt(this.job.salaryMax)} per year`;
    }

    return `${fmt(this.job.salaryMin ?? this.job.salaryMax!)} per year`;
  }

  openApplyModal(): void {
    if (!this.auth.isLoggedIn()) {
      this.toast.error('Please log in to apply');
      this.router.navigate(['/login']);
      return;
    }

    this.showApplyModal = true;
  }

  closeApplyModal(): void {
    this.showApplyModal = false;
    this.coverLetter = '';
  }

  submitApplication(): void {
    if (!this.job) return;

    this.applying = true;

    this.applicationService.applyForJob({
      jobId: this.job.id,
      coverLetter: this.coverLetter || null,
      resumeUrl: null
    }).subscribe({
      next: () => {
        this.toast.success('Application submitted successfully!');
        this.closeApplyModal();
        this.applying = false;
      },
      error: () => {
        this.applying = false;
      }
    });
  }

  editJob(): void {
  if (!this.job) return;

  this.router.navigate(['/employer/jobs/edit', this.job.id]);
}

  deleteJob(): void {
    if (!this.job) return;

    if (!confirm('Are you sure you want to delete this job?')) return;

    this.deleting = true;

    this.jobService.deleteJob(this.job.id).subscribe({
      next: () => {
        this.toast.success('Job deleted successfully');
        this.router.navigate(['/employer/dashboard']);
      },
      error: () => {
        this.deleting = false;
      }
    });
  }
}