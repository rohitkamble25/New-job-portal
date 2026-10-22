import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApplicationRequest } from '../models/dto/application-request';
import { ApiResponse } from '../models/dto/api-response';
import { ApplicationResponse } from '../models/dto/application-response';
import { Observable } from 'rxjs';
import { ApplicationStatus } from '../models/enums/application-status';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  private baseUrl = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  applyForJob(request: ApplicationRequest): Observable<ApiResponse<ApplicationResponse>> {
    return this.http.post<ApiResponse<ApplicationResponse>>(`${this.baseUrl}/apply`, request);
  }

  getMyApplications(): Observable<ApiResponse<ApplicationResponse[]>> {
    return this.http.get<ApiResponse<ApplicationResponse[]>>(`${this.baseUrl}/my`);
  }

  withdrawApplication(applicationId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${applicationId}/withdraw`);
  }

  getApplicationsForJob(jobId: number): Observable<ApiResponse<ApplicationResponse[]>> {
    return this.http.get<ApiResponse<ApplicationResponse[]>>(`${this.baseUrl}/job/${jobId}`);
  }

  getAllEmployerApplications(): Observable<ApiResponse<ApplicationResponse[]>> {
    return this.http.get<ApiResponse<ApplicationResponse[]>>(`${this.baseUrl}/employer/all`);
  }

  updateStatus(
    applicationId: number,
    status: ApplicationStatus,
    notes?: string
  ): Observable<ApiResponse<ApplicationResponse>> {
    let params = new HttpParams().set('status', status);

    if (notes) {
      params = params.set('notes', notes);
    }

    return this.http.patch<ApiResponse<ApplicationResponse>>(
      `${this.baseUrl}/${applicationId}/status`,
      {},
      { params }
    );
  }
}