export type UserRole = 'STUDENT' | 'ADMIN';

export interface IDCardData {
  id: string;
  name: string;
  idNo: string;
  branch: string;
  level: string;
  photoUrl: string;
  signatureUrl: string;
  address: string;
  mobile: string;
  email: string;
  dob: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at?: string;
}

export interface AuthState {
  user: {
    username: string;
    role: UserRole;
  } | null;
}
