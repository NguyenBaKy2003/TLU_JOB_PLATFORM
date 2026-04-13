// src/domain/models/CompanyDetail.ts

export interface Employee {
  id:       string;
  name:     string;
  role:     string;
  avatar?:  string;
}

export interface Review {
  id:       string;
  author:   string;
  role:     string;
  avatar?:  string;
  rating:   number;
  content:  string;
  likes:    number;
  dislikes: number;
}

export interface JobListing {
  id:         string;
  company:    string;
  companyLogo?: string;
  title:      string;
  tags:       string[];   // ["Full Time", "Remote", "Senior"]
  location:   string;
  salary:     string;     // "15-25 triệu"
  postedAgo:  string;     // "3 giờ trước"
}

export interface CompanyDetail {
  id:          string;
  name:        string;
  website:     string;
  logoUrl?:       string;
  coverImage?: string;
  address:    string;
  sizeLabel: number;
  email:       string;
  phone:       string;
  following:   boolean;
  description: string;
  employees:   Employee[];
  reviews:     Review[];
  jobs:        JobListing[];
}