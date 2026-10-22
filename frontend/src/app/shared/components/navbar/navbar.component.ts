import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CompanyService } from '../../../core/services/company.service';
import { Role } from '../../../core/models/enums/role';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  menuOpen = false;
  hasCompany = false;
  Role = Role;

  constructor(
    public auth: AuthService,
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    if (this.auth.userRole() === Role.EMPLOYER) {
      this.loadCompanyStatus();
    }
  }

  loadCompanyStatus(): void {
    this.companyService.getMyCompanies().subscribe({
      next: res => {
        this.hasCompany = (res.data ?? []).length > 0;
      },
      error: () => {
        this.hasCompany = false;
      }
    });
  }

  get initials(): string {
    const name = this.auth.currentUser()?.name ?? '';
    return name
      .split(' ')
      .filter(p => p.length > 0)
      .map(p => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.closeMenu();
    this.auth.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-menu')) {
      this.menuOpen = false;
    }
  }
}
