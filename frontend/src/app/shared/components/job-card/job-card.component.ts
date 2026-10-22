import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JobResponse } from '../../../core/models/dto/job-response';
import { JOB_TYPE_LABELS, JobType } from '../../../core/models/enums/job-type';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-card.component.html',
  styleUrl: './job-card.component.scss'
})
export class JobCardComponent {

  @Input({ required: true }) job!: JobResponse;
  @Input() showApplyButton = true;
  @Input() animationDelay = 0;
  @Output() apply = new EventEmitter<JobResponse>();

  get jobTypeLabel(): string {
    return JOB_TYPE_LABELS[this.job.jobType as JobType] ?? this.job.jobType;
  }

  get skillList(): string[] {
    return this.job.skills
      ? this.job.skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];
  }

  get isNew(): boolean {
    if (!this.job?.createdAt) {
      return false;
    }

    const createdDate = new Date(this.job.createdAt);
    const currentDate = new Date();

    const differenceInTime = currentDate.getTime() - createdDate.getTime();
    const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24);

    return differenceInDays <= 7;
  }

  formatSalary(): string {
    if (!this.job.salaryMin && !this.job.salaryMax) {
      return 'Not disclosed';
    }

    const fmt = (n: number) =>
      '₹' + new Intl.NumberFormat('en-IN').format(n);

    if (this.job.salaryMin && this.job.salaryMax) {
      return `${fmt(this.job.salaryMin)} – ${fmt(this.job.salaryMax)}/yr`;
    }

    return `${fmt(this.job.salaryMin ?? this.job.salaryMax!)}/yr`;
  }

  onApply(event: Event): void {
    event.stopPropagation();
    this.apply.emit(this.job);
  }
}