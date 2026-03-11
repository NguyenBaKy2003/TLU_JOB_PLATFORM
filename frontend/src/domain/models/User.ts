
export type UserRole = "ADMIN" | "SCHOOL" | "DONOR";
export type UserStatus = "ACTIVE" | "INACTIVE";

export interface User {
  userId: string;
  passwordHash: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  oauthProvider: "LOCAL" | "GOOGLE" | "FACEBOOK"; 
  avatarUrl: string | null;
  createdAt: string;
  failedLoginAttempts: number;
  accountLockedUntil: string | null;
  lastLogin: string | null;
  updatedAt: string;
  minutesUntilUnlock: number;
  admin: boolean;
  accountLocked: boolean;
}

export interface UserCredentials {
  email: string
  password: string
}

export interface SignupData extends Omit<User, "id"> {
  password: string
}

export interface OAuthUserData {
  id: string
  userId:string
  email: string
  accessToken: string
  name: string
  fullName:string
  token:string
  avatarUrl: string
  phoneNumber?: string
  role: "ADMIN" | "SCHOOL" | "DONOR"
  refreshToken:string
  provider: "google" | "facebook"
  createdAt:string
  status: "ACTIVE" | "INACTIVE"
}
interface HeaderProps {
  user: User | null;
}
export function Header({ user }: HeaderProps) {
}