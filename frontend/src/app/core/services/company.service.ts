import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/dto/api-response';
import { CompanyResponse } from '../models/dto/company-response';
import { CompanyRequest } from '../models/dto/company-request';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private baseUrl = `${environment.apiUrl}/companies`;


  constructor(private http : HttpClient) {}

  getAllCompanies():Observable<ApiResponse<CompanyResponse[]>>{
    return this.http.get<ApiResponse<CompanyResponse[]>>(this.baseUrl);
  }
  getCompanyById(id : number):Observable<ApiResponse<CompanyResponse>>{
    return this.http.get<ApiResponse<CompanyResponse>>(`${this.baseUrl}/${id}`);
  }
  getMyCompanies(): Observable<ApiResponse<CompanyResponse[]>> {
    return this.http.get<ApiResponse<CompanyResponse[]>>(`${this.baseUrl}/my-companies`);
  }

  createCompany(request: CompanyRequest): Observable<ApiResponse<CompanyResponse>> {
    return this.http.post<ApiResponse<CompanyResponse>>(this.baseUrl, request);
  }

  updateCompany(id: number, request: CompanyRequest): Observable<ApiResponse<CompanyResponse>> {
    return this.http.put<ApiResponse<CompanyResponse>>(`${this.baseUrl}/${id}`, request);
  }

  deleteCompany(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

}
