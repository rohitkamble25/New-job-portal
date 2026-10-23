# Job Portal Web Application

A full-stack job portal that connects job seekers and recruiters through a responsive Angular frontend and a Java Spring Boot backend. The application streamlines recruitment by supporting job postings, job applications, and role-based access control.

## Key Features

- **Role-Based Authentication:** Provides separate access for job seekers and recruiters using Spring Security and JWT.
- **Job Management:** Enables recruiters to create and manage job postings.
- **Job Search:** Allows job seekers to browse available job opportunities.
- **Job Applications:** Supports submitting applications and retrieving applicants for specific job postings.
- **RESTful APIs:** Connects the Angular frontend with the Spring Boot backend.
- **Database Integration:** Uses PostgreSQL for data storage and Hibernate/JPA for persistence.
- **Modular Backend Architecture:** Organizes application logic into controllers, services, repositories, DTOs, and entities.
- **Responsive User Interface:** Uses Angular, TypeScript, HTML, and CSS to provide a user-friendly experience.
- **Build Management:** Uses Maven to manage backend dependencies and builds.

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | Angular, TypeScript, HTML5, CSS3, JavaScript |
| Backend | Java, Spring Boot, Spring Security |
| Authentication | JWT, Role-Based Access Control |
| Database | PostgreSQL |
| ORM & Persistence | Hibernate, Spring Data JPA |
| API Architecture | RESTful APIs |
| Build Tool | Maven |
| Version Control | Git, GitHub |

## Application Flow

1. **Recruiter Authentication:** Recruiters log in to access job management features.
2. **Job Posting:** Recruiters create and manage job listings through backend APIs.
3. **Browse Jobs:** Job seekers explore available job opportunities.
4. **Apply for Jobs:** Job seekers submit applications for relevant positions.
5. **Manage Applicants:** Recruiters retrieve applicants associated with a specific job posting.

## Project Structure

```text
New-job-portal/
├── frontend/       # Angular frontend
├── jobpotral2.o/   # Spring Boot backend
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Java JDK
- Node.js and npm
- PostgreSQL
- Maven
- Angular CLI (if needed)

### 1. Clone the Repository

```bash
git clone https://github.com/rohitkamble25/New-job-portal.git
cd New-job-portal
```

### 2. Configure the Database

Create a PostgreSQL database and configure the database URL, username, and password in the backend application configuration.

Do not commit database credentials or other secrets to GitHub.

### 3. Run the Backend

Open a terminal and execute:

```bash
cd jobpotral2.o
mvn spring-boot:run
```

Ensure PostgreSQL is running and the database configuration is correct.

### 4. Run the Frontend

Open a second terminal from the project root and execute:

```bash
cd frontend
npm install
npx ng serve
```

Open the local URL displayed in the terminal to access the application.

Ensure the frontend API URL points to the running backend.
