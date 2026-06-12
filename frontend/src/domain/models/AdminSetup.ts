// src/domain/models/AdminSetup.ts

export interface AdminSetupResult {
  id:       string;
  email:    string;
  fullName: string;
  role:     'ADMIN';
}

export interface AdminSetupPayload {
  secret:   string;
  email:    string;
  fullName: string;
  password: string;
}