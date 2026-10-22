import { ApplicationStatus } from "./enums/application-status";
import { Job } from "./job";
import { User } from "./user";



export interface Application {
    id : number;
    job : Job;
    applicant : User;
    status : ApplicationStatus;
    coverLetter: String | null;
    resumeUrl : String | null;
    employerNotes : String | null;
    appliedAt : String;
    updatedAt : String;

}
