import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../core/services/job.service';
import { JobCardComponent } from '../../shared/components/job-card/job-card.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { JobResponse } from '../../core/models/dto/job-response';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ApplicationService } from '../../core/services/application.service';
import { Role } from '../../core/models/enums/role';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    JobCardComponent,
    LoaderComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  featuredJobs: JobResponse[] = [];
  loading = true;
  keyword = '';
  location = '';

  stats = [
    { label: 'Open Positions', value: '0' },
    { label: 'Companies Hiring', value: '0' },
    { label: 'Job seekers', value: '0' }
  ];

  constructor(
    private jobService: JobService,
    private applicationService: ApplicationService,
    public auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeaturedJobs();
  }

  loadFeaturedJobs(): void {
    this.jobService.getAllJobs(0, 6).subscribe({
    next: res => {
  this.featuredJobs = res.data?.content ?? [];
  this.stats[0].value = res.data?.totalElements?.toString() ?? '0';
  this.loading = false;
},
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.router.navigate(['/jobs'], {
      queryParams: {
        keyword: this.keyword || null,
        location: this.location || null
      }
    });
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
  coverLetter: '',
  resumeUrl: ''
}).subscribe({
  next: () => {
    this.toast.success(`Applied for ${job.title} successfully!`);
  },
  error: () => {
    this.toast.error('Failed to apply for the job');
  }
});
  }
}