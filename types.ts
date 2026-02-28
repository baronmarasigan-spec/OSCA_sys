export enum Role {
  CITIZEN = 'CITIZEN',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  ENCODER = 'ENCODER',
  APPROVER = 'APPROVER',
}

export enum ApplicationStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  ISSUED = 'Released',
}

export enum IdStatus {
  NEW = 'New',
  PENDING = 'Pending',
  APPROVED = 'Approved',
  RELEASED = 'Released',
  REJECTED = 'Rejected',
}

export enum ApplicationType {
  REGISTRATION = 'Registration',
  ID_NEW = 'New ID',
  ID_RENEWAL = 'ID Renewal',
  ID_REPLACEMENT = 'ID Replacement',
  BENEFIT_CASH = 'Cash Gift',
  BENEFIT_MED = 'Medical Assistance',
  PHILHEALTH = 'PhilHealth',
}

export interface User {
  id: string;
  name: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffix?: string;
  role: Role;
  email: string;
  avatarUrl?: string;
  birthDate?: string; // ISO string
  address?: string;
  seniorIdNumber?: string; // Only for approved citizens
  seniorIdIssueDate?: string; // ISO string
  seniorIdExpiryDate?: string; // ISO string
  contactNumber?: string;
  houseNo?: string;
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  district?: string;
  emergencyContact?: string; // Legacy string
  emergencyContactPerson?: string;
  emergencyContactNumber?: string;
  username?: string; 
  password?: string;
  
  // Extended Profile Fields
  sex?: string;
  civilStatus?: string;
  birthPlace?: string;
  citizenship?: string;
  livingArrangement?: string;
  isPensioner?: boolean;
  pensionAmount?: string;
  pensionSource?: string;
  hasIllness?: boolean;
  illnessDetails?: string;
  bloodType?: string;
  joinFederation?: boolean;
}

export interface Application {
  id: string;
  userId: string;
  userName: string;
  type: ApplicationType;
  date: string;
  status: ApplicationStatus;
  description: string;
  documents?: string[]; 
  rejectionReason?: string;
  releasedDate?: string;
  
  // Captured Form Data for ID
  formData?: Partial<{
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string;
    birthDate: string;
    birthPlace: string;
    sex: string;
    citizenship: string;
    civilStatus: string;
    address: string;
    // Granular address for API mapping
    houseNo?: string;
    street?: string;
    barangay?: string;
    district?: string;
    city?: string;
    province?: string;
    contactNumber: string;
    scid_number?: string;
    email?: string;
    emergencyContactPerson: string;
    emergencyContactNumber: string;
    joinFederation: boolean;
    capturedImage?: string;
    // Socio-economic fields for API
    livingArrangement?: string;
    isPensioner?: boolean;
    pensionSource?: string;
    pensionAmount?: string;
    hasIllness?: boolean;
    illnessDetails?: string;
    benefitProgram?: string;
    remarks?: string;
  }>;
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  date: string;
  subject: string;
  details: string;
  status: 'Open' | 'Resolved';
  aiSummary?: string; 
}

export interface MasterlistRecord {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string;
  birthPlace: string;
  seniorIdNumber?: string;
  scid_number?: string;
  id_status: string;
  address: string;
  house_no?: string;
  street?: string;
  barangay?: string;
  city_municipality?: string;
  province?: string;
  district?: string;
  email?: string;
  contact_number?: string;
  sex?: string;
  civilStatus?: string;
  username?: string;
  password?: string;
  releasedDate?: string;
  formData?: any;
}

export interface StatMetric {
  label: string;
  value: number | string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface RegistryRecord {
  id: string; 
  type: 'LCR' | 'PWD';
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  citizenship?: string;
  birthDate: string;
  birthPlace?: string; 
  sex?: string;
  civilStatus?: string;
  province?: string;
  city?: string;
  district?: string;
  barangay?: string;
  street?: string;
  houseNo?: string;
  address?: string; 
  isRegistered: boolean; 
  age?: number;
  status?: string;
}
