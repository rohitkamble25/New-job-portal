
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/dto/api-response';
import { UserResponse } from '../models/dto/user-response';
import { UpdateProfileRequest } from '../models/dto/update-profile-request';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  updateProfile(
    request: UpdateProfileRequest
  ): Observable<ApiResponse<UserResponse>> {
    return this.http.put<ApiResponse<UserResponse>>(
      this.baseUrl,
      request
    );
  }

  uploadResume(
    file: File
  ): Observable<ApiResponse<UserResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<UserResponse>>(
      `${this.baseUrl}/resume`,
      formData
    );
  }

  viewResume(filename: string): Observable<Blob> {
  return this.http.get(
    `${this.baseUrl}/resume/view/${encodeURIComponent(filename)}`,
    { responseType: 'blob' }
  );
}
}
