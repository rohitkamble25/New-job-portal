import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/dto/api-response';
import { PagedResponse } from '../models/dto/paged-response';
import { Job } from '../models/job';
import { JobRequest } from '../models/dto/job-request';
import { JobResponse } from '../models/dto/job-response';
import { JobType } from '../models/enums/job-type';

@Injectable({
  providedIn: 'root'
})
export class JobService {


  private baseUrl = `${environment.apiUrl}/jobs`;


  constructor(private http : HttpClient) {}
  
  getAllJobs(page = 0, size = 10): Observable<ApiResponse<PagedResponse<JobResponse>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PagedResponse<JobResponse>>>(this.baseUrl, { params });
  }
  

  searchJobs(filters:{
    keyword?:string;
    location?:string;
    jobType?:JobType | '';
    minSalary?:number;
    page?:number;
    size?:number;
  }):Observable<ApiResponse<PagedResponse<JobResponse>>>{
    let params = new HttpParams()
    .set('page',filters.page ?? 0)
    .set('size',filters.size ?? 10);


     if(filters.keyword) params = params.set('keyword', filters.keyword);
    if (filters.location) params = params.set('location', filters.location);
    if (filters.jobType) params = params.set('jobType', filters.jobType);
    if (filters.minSalary) params = params.set('minSalary', filters.minSalary);

        return this.http.get<ApiResponse<PagedResponse<JobResponse>>>(`${this.baseUrl}/search`, { params });

  }

   getJobById(id: number): Observable<ApiResponse<JobResponse>> {
    return this.http.get<ApiResponse<JobResponse>>(`${this.baseUrl}/${id}`);
  }

  createJob(request: JobRequest): Observable<ApiResponse<JobResponse>> {
    return this.http.post<ApiResponse<JobResponse>>(this.baseUrl, request);
  }

  updateJob(id:number,request: JobRequest):Observable<ApiResponse<JobResponse>>{
    return this.http.put<ApiResponse<JobResponse>>(`${this.baseUrl}/${id}`,request);
  }

  deleteJob(id:number):Observable<ApiResponse<void>>{
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  toggleJobStatus(id:number):Observable<ApiResponse<void>>{
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${id}/toggle`,{});
  }

  getMyJobs(): Observable<ApiResponse<JobResponse[]>>{
    return this.http.get<ApiResponse<JobResponse[]>>(`${this.baseUrl}/my-jobs`);
  }
}
