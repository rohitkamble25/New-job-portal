import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { JobService } from '../../../core/services/job.service';
import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

import { JobCardComponent } from '../../../shared/components/job-card/job-card.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

import { JobResponse } from '../../../core/models/dto/job-response';
import { JobType, JOB_TYPE_LABELS } from '../../../core/models/enums/job-type';
import { Role } from '../../../core/models/enums/role';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    JobCardComponent,
    LoaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss'
})
export class JobListComponent implements OnInit {

  jobs: JobResponse[] = [];

  loading = true;

  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;

  keyword = '';
  location = '';
  selectedJobType: JobType | '' = '';
  minSalary: number | null = null;

  jobTypes = Object.values(JobType);
  jobTypeLabels = JOB_TYPE_LABELS;

  constructor(
    private jobService: JobService,
    private applicationService: ApplicationService,
    public auth: AuthService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.keyword = params['keyword'] || '';
      this.location = params['location'] || '';

      this.currentPage = 0;

      this.loadJobs();
    });
  }

  loadJobs(): void {
    this.loading = true;

    const hasFilters =
      !!this.keyword ||
      !!this.location ||
      !!this.selectedJobType ||
      this.minSalary !== null;

    const request$ = hasFilters
      ? this.jobService.searchJobs({
          keyword: this.keyword || undefined,
          location: this.location || undefined,
          jobType: this.selectedJobType || undefined,
          minSalary: this.minSalary ?? undefined,
          page: this.currentPage,
          size: this.pageSize
        })
      : this.jobService.getAllJobs(
          this.currentPage,
          this.pageSize
        );

   request$.subscribe({
  next: res => {
    if (res.data) {
      this.jobs = res.data.content;
      this.totalElements = res.data.totalElements;
      this.totalPages = res.data.totalPages;
    }

    this.loading = false;
  },
  error: () => {
    this.loading = false;
  }
});
  }

  search(): void {
    this.currentPage = 0;

    this.router.navigate([], {
      queryParams: {
        keyword: this.keyword || null,
        location: this.location || null
      },
      queryParamsHandling: 'merge'
    });
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadJobs();
  }

  clearFilters(): void {
    this.keyword = '';
    this.location = '';
    this.selectedJobType = '';
    this.minSalary = null;
    this.currentPage = 0;

    this.router.navigate(['/jobs']);
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) {
      return;
    }

    this.currentPage = page;
    this.loadJobs();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  get pages(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, i) => i
    );
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.keyword ||
      this.location ||
      this.selectedJobType ||
      this.minSalary !== null
    );
  }

 onApply(job: JobResponse): void {
  if (!this.auth.isLoggedIn()) {
    this.toast.error('Please log in to apply for jobs');
    this.router.navigate(['/login']);
    return;
  }

  if (this.auth.userRole() !== Role.JOBSEEKER) {
    this.toast.error('Only job seekers can apply for jobs');
    return;
  }

  this.applicationService.applyForJob({
    jobId: job.id,
    coverLetter: null,
    resumeUrl: null
  }).subscribe({
    next: () => {
      this.toast.success(`Applied for "${job.title}" successfully!`);
    },
    error: () => {}
  });
}
}