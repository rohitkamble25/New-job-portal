import { Component,OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";
import { LoaderComponent } from "../../../shared/components/loader/loader.component";
import { EmptyStateComponent } from "../../../shared/components/empty-state/empty-state.component";
import { JobResponse } from "../../../core/models/dto/job-response";
import { JOB_TYPE_LABELS, JobType } from '../../../core/models/enums/job-type';
import { JobService } from "../../../core/services/job.service";
import { CompanyService } from "../../../core/services/company.service";

@Component({
  selector: 'app-employer-dashboard',
  standalone: true,
  imports: [CommonModule,RouterModule,LoaderComponent,EmptyStateComponent],
  templateUrl: './employer-dashboard.component.html',
  styleUrl: './employer-dashboard.component.scss'
})
export class EmployerDashboardComponent implements OnInit{
  jobs:JobResponse[] = [];
  loading = true;
  togglingId: number | null = null;
  deletingId: number | null = null;

  companyExists = false;
companyLoading = true;

  constructor(
    private jobService:JobService,
    public auth: AuthService,
    private toast: ToastService,
    private companyService: CompanyService,

  ){}

  ngOnInit(): void {
      this.loadJobs();
  this.loadCompany();
  }
   loadJobs(): void{
    this.jobService.getMyJobs().subscribe({
      next: res => {
        this.jobs = res.data ?? [];
        this.loading = false;
      },
      error: () =>{this.loading = false; }
    });
  }

 loadCompany(): void {
  this.companyService.getMyCompanies().subscribe({
    next: res => {
      this.companyExists = !!res.data;
      this.companyLoading = false;
    },
    error: () => {
      this.companyExists = false;
      this.companyLoading = false;
    }
  });
}

    get activeJobs(): JobResponse[]{
      return this.jobs.filter(j => j.isActive);
    }
    get inactiveJobs(): JobResponse[]{
      return this.jobs.filter(j => !j.isActive);

    }

    get totalJobs():number{
      return this.jobs.length;
    }

    jobTypeLabel(jobType: String): string{
      return JOB_TYPE_LABELS[jobType as JobType] ?? jobType;

    }

    formatSalary(job: JobResponse): string {
    if (!job.salaryMin && !job.salaryMax) return 'Not disclosed';
    const fmt = (n: number) =>
      '₹' + new Intl.NumberFormat('en-IN').format(n);
    if (job.salaryMin && job.salaryMax)
      return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`;
    return fmt(job.salaryMin ?? job.salaryMax!);
  }

   toggleJob(job: JobResponse): void {
    this.togglingId = job.id;
    this.jobService.toggleJobStatus(job.id).subscribe({
      next: () => {
        job.isActive = !job.isActive;
        this.toast.success(
          job.isActive ? 'Job activated' : 'Job deactivated'
        );
        this.togglingId = null;
      },
      error: () => { this.togglingId = null; }
    });
  }

  deleteJob(job: JobResponse): void {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    this.deletingId = job.id;

    this.jobService.deleteJob(job.id).subscribe({
      next: () => {
        this.jobs = this.jobs.filter(j => j.id !== job.id);
        this.toast.success('Job deleted successfully');
        this.deletingId = null;
      },
      error: () => { this.deletingId = null; }
    });
  }
   get userName(): string {
    return this.auth.currentUser()?.name ?? '';
  }


  
}
