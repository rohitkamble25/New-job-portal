import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder,FormGroup,Validators} from '@angular/forms';
import { JobService } from '../../../core/services/job.service';
import { CompanyService } from '../../../core/services/company.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { JobRequest } from '../../../core/models/dto/job-request';
import { CompanyResponse } from '../../../core/models/dto/company-response';
import { JobType, JOB_TYPE_LABELS } from '../../../core/models/enums/job-type';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LoaderComponent
  ],
  templateUrl: './job-form.component.html',
  styleUrl: './job-form.component.scss'
})
export class JobFormComponent implements OnInit {
  form: FormGroup;
  loading = true;
  saving = false;
  isEditMode = false;
  jobId: number | null = null;

  companies: CompanyResponse[] = [];
  jobTypes = Object.values(JobType);
  jobTypeLabels = JOB_TYPE_LABELS;

  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    private companyService: CompanyService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {
this.form = this.fb.group({
  title: ['', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(255)
  ]],

  description: ['', [
    Validators.required,
    Validators.minLength(20),
    Validators.maxLength(10000)
  ]],

  location: ['', [
    Validators.required,
    Validators.maxLength(255)
  ]],

  jobType: ['', [
    Validators.required
  ]],

  salaryMin: [null, [
    Validators.min(0)
  ]],

  salaryMax: [null, [
    Validators.min(0)
  ]],

  experience: ['', [
    Validators.maxLength(255)
  ]],

  skills: ['', [
    Validators.maxLength(5000)
  ]],

  vacancies: [1, [
    Validators.required,
    Validators.min(1),
    Validators.pattern(/^\d+$/)
  ]],

  lastDate: [''],

  companyId: [null, [
    Validators.required,
    Validators.min(1)
  ]]
});
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.jobId = Number(id);
    }

    this.companyService.getMyCompanies().subscribe({
      next: res => {
        this.companies = res.data?.filter(c => c.isApproved) ?? [];

        if (this.companies.length === 0) {
          this.toast.error(
            'You need an approved company before posting jobs'
          );
          this.router.navigate(['/employer/company']);
          return;
        }

        if (this.isEditMode && this.jobId) {
          this.loadJob(this.jobId);
        } else {
          this.form.patchValue({
            companyId: this.companies[0].id
          });

          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadJob(id: number): void {
    this.jobService.getJobById(id).subscribe({
      next: res => {
        const job = res.data;

        if (!job) {
          this.loading = false;
          this.router.navigate(['/employer/dashboard']);
          return;
        }

        this.form.patchValue({
          title: job.title,
          description: job.description,
          location: job.location,
          jobType: job.jobType,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          experience: job.experience ?? '',
          skills: job.skills ?? '',
          vacancies: job.vacancies,
          lastDate: job.lastDate ?? '',
          companyId: job.companyId
        });

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/employer/dashboard']);
      }
    });
  }

  get title() {
    return this.form.get('title')!;
  }

  get description() {
    return this.form.get('description')!;
  }

  get location() {
    return this.form.get('location')!;
  }

  get jobType() {
    return this.form.get('jobType')!;
  }

  get companyId() {
    return this.form.get('companyId')!;
  }

  get vacancies() {
    return this.form.get('vacancies')!;
  }
  get salaryRangeInvalid(): boolean {
  const min = this.form.get('salaryMin')?.value;
  const max = this.form.get('salaryMax')?.value;

  return min != null && max != null && max < min;
}

  onSubmit(): void {
   if (this.form.invalid || this.salaryRangeInvalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.saving = true;

  const request: JobRequest = this.form.value;

    const request$ =
      this.isEditMode && this.jobId
        ? this.jobService.updateJob(this.jobId, request)
        : this.jobService.createJob(request);

    request$.subscribe({
      next: () => {
        this.toast.success(
          this.isEditMode
            ? 'Job updated successfully'
            : 'Job posted successfully'
        );

        this.router.navigate(['/employer/dashboard']);
      },
      error: () => {
        this.saving = false;
      }
    });
  }
}