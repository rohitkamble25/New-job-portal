package com.example.jobpotral2.repo;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.jobpotral2.entity.Job;
import com.example.jobpotral2.entity.User;
import com.example.jobpotral2.enums.JobType;

@Repository
public interface JobRepo extends JpaRepository<Job, Long> {

    Page<Job> findByIsActiveTrue(Pageable pageable);

    List<Job> findByPostedBy(User postedBy);

    @Query("""
                SELECT j FROM Job j
                WHERE j.isActive = true
                  AND (:keyword IS NULL OR :keyword = ''
                       OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
                  AND (:location IS NULL OR :location = ''
                       OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%')))
                  AND (:jobType IS NULL OR j.jobType = :jobType)
                  AND (:minSalary IS NULL OR j.salaryMax >= :minSalary)
            """)
    Page<Job> searchJobs(
            @Param("keyword") String keyword,
            @Param("location") String location,
            @Param("jobType") JobType jobType,
            @Param("minSalary") Double minSalary,
            Pageable pageable);

    List<Job> findByCompanyId(Long companyId);

    long countByIsActiveTrue();
}