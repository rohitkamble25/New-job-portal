import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './core/models/enums/role';


import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { JobDetailComponent } from './features/jobs/job-detail/job-detail.component';
import { JobListComponent } from './features/jobs/job-list/job-list.component';

import { SeekerDashboardComponent } from './features/seeker/seeker-dashboard/seeker-dashboard.component';
import { ProfileComponent } from './features/seeker/profile/profile.component';

import { EmployerDashboardComponent } from './features/employer/employer-dashboard/employer-dashboard.component';
import { CompanyFormComponent } from './features/employer/company-form/company-form.component';
import { ApplicantsListComponent } from './features/employer/applicants-list/applicants-list.component';
import { JobFormComponent } from './features/jobs/job-form/job-form.component';

import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { AdminLoginComponent } from './features/admin/admin-login/admin-login.component';

export const routes: Routes = [
    {
        path:'',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path:'login',
        component: LoginComponent
    },
    {
        path:'register',
        component: RegisterComponent
    },
    {
        path:'jobs',
        component: JobListComponent
    },
    {
        path:'jobs/:id',
        component: JobDetailComponent
    },

    {
        path:'profile',
        component: ProfileComponent,
        canActivate:[authGuard]
    },

    {
        path:'my-applications',
        component:SeekerDashboardComponent,
        canActivate:[roleGuard([Role.JOBSEEKER])]
    },

    {
        path:'employer/dashboard',
        component:EmployerDashboardComponent,
        canActivate:[roleGuard([Role.EMPLOYER])]
    },

    {
        path:'employer/post-job',
        component:JobFormComponent,
        canActivate:[roleGuard([Role.EMPLOYER])]
    },
    {
    path: 'employer/edit-job/:id',
    component: JobFormComponent,
    canActivate: [roleGuard([Role.EMPLOYER])]
  },
  {
    path: 'employer/applicants/:jobId',
    component:ApplicantsListComponent,
    canActivate:[roleGuard([Role.EMPLOYER])]
  },
{
  path: 'employer/company',
  component: CompanyFormComponent,
  canActivate: [roleGuard([Role.EMPLOYER])]
},
{
  path: 'admin/login',
  component: AdminLoginComponent
},
{
  path: 'admin',
  component: AdminDashboardComponent,
  canActivate: [roleGuard([Role.ADMIN])]
},

  {
    path: '**',
    redirectTo: 'login'
  }


];


