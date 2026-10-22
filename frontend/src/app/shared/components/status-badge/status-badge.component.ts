import { Component,Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationStatus, STATUS_LABELS } from '../../../core/models/enums/application-status';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss'
})
export class StatusBadgeComponent {
   @Input({ required: true }) status!: ApplicationStatus;

  get label(): string {
    return STATUS_LABELS[this.status];
  }
}
