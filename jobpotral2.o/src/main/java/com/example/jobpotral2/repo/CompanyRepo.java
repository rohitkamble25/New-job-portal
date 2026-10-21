package com.example.jobpotral2.repo;

import com.example.jobpotral2.entity.Company;
import com.example.jobpotral2.entity.User;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepo extends JpaRepository<Company, Long> {
    List<Company> findByEmployer(User employer);

    List<Company> findByIsApproved(boolean isApproved);

    boolean existsByNameAndEmployer(String name, User employer);
    
    boolean existsByEmployer(User employer);
}
