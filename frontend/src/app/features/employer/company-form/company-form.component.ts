import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../../../core/services/company.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { CompanyRequest } from '../../../core/models/dto/company-request';
import { CompanyResponse } from '../../../core/models/dto/company-response';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LoaderComponent],
  templateUrl: './company-form.component.html',
  styleUrl: './company-form.component.scss'
})
export class CompanyFormComponent implements OnInit {
  form: FormGroup;
  loading = true;
  saving = false;
  isEditMode = false;
  existingCompany: CompanyResponse | null = null;

  industries = [
    'Information Technology',
    'Software Development',
    'E-Commerce',
    'Finance & Banking',
    'Healthcare',
    'Education',
    'Manufacturing',
    'Consulting',
    'Media & Entertainment',
    'Telecommunications',
    'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private toast: ToastService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      website: [''],
      location: ['', Validators.required],
      industry: ['']
    });
  }

  ngOnInit(): void {
    this.companyService.getMyCompanies().subscribe({
      next: res => {
        const companies = res.data ?? [];
        if (companies.length > 0) {
          this.isEditMode = true;
          this.existingCompany = companies[0];

          this.form.patchValue({
            name: this.existingCompany.name,
            description: this.existingCompany.description ?? '',
            website: this.existingCompany.website ?? '',
            location: this.existingCompany.location,
            industry: this.existingCompany.industry ?? ''
          });
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get name() {
    return this.form.get('name')!;
  }

  get location() {
    return this.form.get('location')!;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    const request: CompanyRequest = this.form.value;

    const request$ = this.isEditMode && this.existingCompany
      ? this.companyService.updateCompany(this.existingCompany.id, request)
      : this.companyService.createCompany(request);

    request$.subscribe({
      next: () => {
        this.toast.success(
          this.isEditMode
            ? 'Company updated successfully'
            : 'Company registered! Waiting for admin approval.'
        );

        this.router.navigate(['/employer/dashboard']);
      },
      error: () => {
        this.saving = false;
      }
    });
  }
}