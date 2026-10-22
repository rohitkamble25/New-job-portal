
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { UserResponse } from '../../../core/models/dto/user-response';
import { UpdateProfileRequest } from '../../../core/models/dto/update-profile-request';
import { Role } from '../../../core/models/enums/role';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  form: FormGroup;
  loading = true;
  saving = false;
  uploading = false;
  user: UserResponse | null = null;
  Role = Role;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private profileService: ProfileService,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      name: [''],
      phoneNumber: [''],
      profileSummary: ['']
    });
  }

  ngOnInit(): void {
    this.auth.getProfile().subscribe({
      next: res => {
        if (res.data) {
          this.user = res.data;
          this.form.patchValue({
            name: this.user.name,
            phoneNumber: this.user.phoneNumber ?? '',
            profileSummary: this.user.profileSummary ?? ''
          });
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get initials(): string {
    return this.user?.name
      ?.split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? '';
  }

  get userRole(): string {
    const role = this.auth.userRole();

    if (role === Role.JOBSEEKER) return 'Job Seeker';
    if (role === Role.EMPLOYER) return 'Employer';

    return 'Admin';
  }

  get isSeeker(): boolean {
    return this.auth.userRole() === Role.JOBSEEKER;
  }

  saveProfile(): void {
    if (this.form.invalid || this.saving) return;

    const request: UpdateProfileRequest = this.form.getRawValue();

    this.saving = true;

    this.profileService.updateProfile(request).subscribe({
      next: res => {
        if (res.data) {
          this.user = res.data;
        }

        this.toast.success(String(res.message || 'Profile updated successfully'));
        this.saving = false;
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  onResumeSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.toast.error('Only PDF files are allowed');
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toast.error('File size must be less than 5MB');
      input.value = '';
      return;
    }

    this.uploading = true;

    this.profileService.uploadResume(file).subscribe({
      next: res => {
        if (res.data) {
          this.user = res.data;
        }

        this.toast.success(String(res.message || 'Resume uploaded successfully'));
        this.uploading = false;
        input.value = '';
      },
      error: () => {
        this.uploading = false;
        input.value = '';
      }
    });
  }

  viewResume(): void {
    const resumeUrl = this.user?.resumeUrl;

    if (!resumeUrl) {
      this.toast.error('No resume uploaded');
      return;
    }

    const filename = resumeUrl.split('/').pop();

    if (!filename) {
      this.toast.error('Invalid resume URL');
      return;
    }

    this.profileService.viewResume(filename).subscribe({
      next: (blob: Blob) => {
        const pdfUrl = URL.createObjectURL(blob);
        window.open(pdfUrl, '_blank');
      },
      error: () => {
        this.toast.error('Unable to open resume');
      }
    });
  }
}
