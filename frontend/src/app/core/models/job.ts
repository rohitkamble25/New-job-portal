import { Company } from "./company";
import { JobType } from "./enums/job-type";
import { User } from "./user";





export interface Job {

    id: number;
    title : String;
    description : String;
    location : String;
    jobType : JobType;
    salaryMin : String | null;
    salaryMax : String | null;
    experience : String| null;
    skills : String | null;
    vacancies : number;
    lastDate: string;
    isActive: boolean;
    company: Company;
    postedBy: User;
    createdAt: string;
    updatedAt: string;

}
