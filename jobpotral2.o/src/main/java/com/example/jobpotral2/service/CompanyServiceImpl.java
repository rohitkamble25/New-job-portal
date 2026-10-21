
package com.example.jobpotral2.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.jobpotral2.dto.CompanyRequest;
import com.example.jobpotral2.dto.CompanyResponse;
import com.example.jobpotral2.entity.Company;
import com.example.jobpotral2.entity.User;
import com.example.jobpotral2.repo.CompanyRepo;
import com.example.jobpotral2.repo.UserRepo;
import com.example.jobpotral2.security.BadRequestException;
import com.example.jobpotral2.security.ResourceNotFoundException;
import com.example.jobpotral2.security.UnauthorizedException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepo companyRepo;
    private final UserRepo userRepo;

    @Override
    public CompanyResponse createCompany(CompanyRequest request, String employerEmail) {
        User employer = getUser(employerEmail);

        if (companyRepo.existsByEmployer(employer)) {
            throw new BadRequestException("You can create only one company per employer");
        }

        Company company = Company.builder()
                .name(request.name())
                .description(request.description())
                .website(request.website())
                .location(request.location())
                .industry(request.industry())
                .employer(employer)
                .isApproved(false)
                .build();

        return CompanyResponse.from(companyRepo.save(company));
    }

    @Override
    public CompanyResponse updateCompany(Long companyId, CompanyRequest request, String employerEmail) {
        User employer = getUser(employerEmail);
        Company company = getCompany(companyId);
        verifyOwner(company, employer);

        company.setName(request.name());
        company.setDescription(request.description());
        company.setWebsite(request.website());
        company.setLocation(request.location());
        company.setIndustry(request.industry());

        return CompanyResponse.from(companyRepo.save(company));
    }

    @Override
    public void deleteCompany(Long companyId, String employerEmail) {
        User employer = getUser(employerEmail);
        Company company = getCompany(companyId);
        verifyOwner(company, employer);
        companyRepo.delete(company);
    }

    @Override
    public CompanyResponse getCompanyById(Long companyId) {
        return CompanyResponse.from(getCompany(companyId));
    }

    @Override
    public List<CompanyResponse> getAllCompanies() {
        return companyRepo.findAll()
                .stream()
                .map(CompanyResponse::from)
                .toList();
    }

    @Override
    public List<CompanyResponse> getMyCompanies(String employerEmail) {
        User employer = getUser(employerEmail);

        return companyRepo.findByEmployer(employer)
                .stream()
                .map(CompanyResponse::from)
                .toList();
    }

    @Override
    public CompanyResponse approveCompany(Long companyId) {
        Company company = getCompany(companyId);
        company.setApproved(true);

        return CompanyResponse.from(companyRepo.save(company));
    }

    private User getUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private Company getCompany(Long id) {
        return companyRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
    }

    private void verifyOwner(Company company, User employer) {
        if (!company.getEmployer().getId().equals(employer.getId())) {
            throw new UnauthorizedException("You don't own this company");
        }
    }
}
