package com.example.jobpotral2.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.jobpotral2.entity.JobApplication;
import com.example.jobpotral2.dto.ApplicationRequest;
import com.example.jobpotral2.dto.ApplicationResponse;
import com.example.jobpotral2.entity.Job;
import com.example.jobpotral2.entity.User;
import com.example.jobpotral2.enums.ApplicationStatus;
import com.example.jobpotral2.repo.ApplicationRepo;
import com.example.jobpotral2.repo.JobRepo;
import com.example.jobpotral2.repo.UserRepo;
import com.example.jobpotral2.security.BadRequestException;
import com.example.jobpotral2.security.ResourceNotFoundException;
import com.example.jobpotral2.security.UnauthorizedException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final JobRepo jobRepo;

    private final UserRepo userRepo;

    private final ApplicationRepo applicationRepo;

    @Override
    public ApplicationResponse applyForJob(ApplicationRequest request, String applicantEmail) {
        User applicant = getUser(applicantEmail);
        Job job = getJob(request.jobId());

        if (!job.isActive()) {
            throw new BadRequestException("This job is no longer accepting applications");
        }

        if (applicationRepo.existsByJobAndApplicant(job, applicant)) {
            throw new BadRequestException("You have already applied for this job");
        }

        JobApplication application = JobApplication.builder()
                .job(job)
                .applicant(applicant)
                .coverLetter(request.coverLetter())
                .resumeUrl(request.resumeUrl() != null ? request.resumeUrl() : applicant.getResumeUrl())
                .status(ApplicationStatus.PENDING)
                .build();

        return ApplicationResponse.from(applicationRepo.save(application));

    }

    @Override
    public List<ApplicationResponse> getMyApplications(String applicantEmail) {
        User applicant = getUser(applicantEmail);
        return applicationRepo.findByApplicant(applicant).stream().map(ApplicationResponse::from).toList();
    }

    @Override
    public List<ApplicationResponse> getApplicationsForJob(Long jobId, String employerEmail) {
        User employer = getUser(employerEmail);
        Job job = getJob(jobId);

        if (!job.getPostedBy().getId().equals(employer.getId())) {
            throw new UnauthorizedException("You don't own this job");
        }

        return applicationRepo.findByJob(job).stream().map(ApplicationResponse::from).toList();
    }

    @Override
    public List<ApplicationResponse> getAllApplicationsForEmployer(String employerEmail) {
        User employer = getUser(employerEmail);
        return applicationRepo.findAllByEmployer(employer).stream().map(ApplicationResponse::from).toList();
    }

    @Override
    public ApplicationResponse updateApplicationStatus(
            Long applicationId,
            ApplicationStatus status,
            String employerNotes,
            String employerEmail) {

        User employer = getUser(employerEmail);
        JobApplication application = getApplication(applicationId);

        if (!application.getJob().getPostedBy().getId()
                .equals(employer.getId())) {
            throw new UnauthorizedException(
                    "You don't have permission to update this application");
        }

        if (status == null) {
            throw new BadRequestException(
                    "Application status is required");
        }

        ApplicationStatus currentStatus = application.getStatus();

        if (currentStatus == ApplicationStatus.ACCEPTED
                || currentStatus == ApplicationStatus.REJECTED) {
            throw new BadRequestException(
                    "Accepted or rejected applications cannot be processed further");
        }

        if (currentStatus == ApplicationStatus.SHORTLISTED
                && status != ApplicationStatus.ACCEPTED
                && status != ApplicationStatus.REJECTED) {
            throw new BadRequestException(
                    "Shortlisted applications can only be accepted or rejected");
        }

        if (currentStatus == ApplicationStatus.REVIEWED
                && status == ApplicationStatus.PENDING) {
            throw new BadRequestException(
                    "Reviewed applications cannot be moved back to pending");
        }

        application.setStatus(status);

        if (employerNotes != null) {
            application.setEmployerNotes(employerNotes);
        }

        return ApplicationResponse.from(
                applicationRepo.save(application));
    }

    @Override
    public void withdrawApplication(Long applicationId, String applicantEmail) {
        User applicant = getUser(applicantEmail);
        JobApplication application = getApplication(applicationId);

        if (!application.getApplicant().getId().equals(applicant.getId())) {
            throw new UnauthorizedException("You can only withdraw your own application");
        }

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new BadRequestException("Cannot withdraw an application that has already been processed");
        }

        applicationRepo.delete(application);
    }

    private User getUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private Job getJob(Long id) {
        return jobRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
    }

    private JobApplication getApplication(Long id) {
        return applicationRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
    }

}
