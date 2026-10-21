package com.example.jobpotral2.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;

import com.example.jobpotral2.dto.JobRequest;
import com.example.jobpotral2.dto.JobResponse;
import com.example.jobpotral2.entity.Company;
import com.example.jobpotral2.entity.Job;
import com.example.jobpotral2.entity.User;
import com.example.jobpotral2.enums.JobType;
import com.example.jobpotral2.repo.CompanyRepo;
import com.example.jobpotral2.repo.JobRepo;
import com.example.jobpotral2.repo.UserRepo;
import com.example.jobpotral2.security.BadRequestException;
import com.example.jobpotral2.security.ResourceNotFoundException;
import com.example.jobpotral2.security.UnauthorizedException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final UserRepo userRepo;

    private final CompanyRepo companyRepo;

    private final JobRepo jobRepo;

    @Override
    public JobResponse createJob(JobRequest request, String employerEmail) {
        User employer = getUser(employerEmail);

        Company company = getCompanyAndVerifyOwner(request.companyId(), employer);

        if (!company.isApproved()) {
            throw new BadRequestException("Company is not approved yet.Please wait for admin approval.");

        }

        Job job = Job.builder()
                .title(request.title())
                .description(request.description())
                .location(request.location())
                .jobType(request.jobType())
                .salaryMin(request.salaryMin())
                .salaryMax(request.salaryMax())
                .experience(request.experience())
                .skills(request.skills())
                .vacancies(request.vacancies())
                .lastDate(request.lastDate())
                .isActive(true)
                .company(company)
                .postedBy(employer)
                .build();

        return JobResponse.from(jobRepo.save(job));

    }

    @Override
    public JobResponse updateJob(Long jobId, JobRequest request, String employerEmail) {
        User employer = getUser(employerEmail);

        Job job = getJob(jobId);

        verifyJobOwner(job, employer);

        job.setTitle(request.title());
        job.setDescription(request.description());
        job.setLocation(request.location());
        job.setJobType(request.jobType());
        job.setSalaryMin(request.salaryMin());
        job.setSalaryMax(request.salaryMax());
        job.setExperience(request.experience());
        job.setSkills(request.skills());
        job.setVacancies(request.vacancies());
        job.setLastDate(request.lastDate());

        return JobResponse.from(jobRepo.save(job));
    }

    @Override
    public void deleteJob(Long jobId, String employerEmail) {
        User employer = getUser(employerEmail);
        Job job = getJob(jobId);
        verifyJobOwner(job, employer);
        jobRepo.delete(job);
    }

    @Override
    public JobResponse getJobById(Long jobId) {
        return JobResponse.from(getJob(jobId));
    }

    @Override
    public Page<JobResponse> getAllActiveJobs(Pageable pageable) {
        return jobRepo.findByIsActiveTrue(pageable).map(JobResponse::from);
    }

    @Override
    public Page<JobResponse> searchJobs(String keyword, String location, JobType jobType, Double minSalary,
            Pageable pageable) {

        return jobRepo.searchJobs(keyword, location, jobType, minSalary, pageable)
                .map(JobResponse::from);
    }

    @Override
    public void toggleJobStatus(Long jobId, String employerEmail) {
        User employer = getUser(employerEmail);
        Job job = getJob(jobId);
        verifyJobOwner(job, employer);
        job.setActive(!job.isActive());
        jobRepo.save(job);
    }

    @Override
    public List<JobResponse> getJobByEmployer(String employerEmail) {
        User employer = getUser(employerEmail);
        return jobRepo.findByPostedBy(employer).stream()
                .map(JobResponse::from).toList();
    }

    private User getUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private Job getJob(Long id) {
        return jobRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
    }

    private Company getCompanyAndVerifyOwner(Long companyId, User employer) {
        Company company = companyRepo.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));
        if (!company.getEmployer().getId().equals(employer.getId())) {
            throw new UnauthorizedException("You don't own this company");
        }
        return company;
    }

    private void verifyJobOwner(Job job, User employer) {
        if (!job.getPostedBy().getId().equals(employer.getId())) {
            throw new UnauthorizedException("You don't have permission to modify this job");
        }
    }

}
