export type RecordStatus = 'ACTIVE' | 'INACTIVE';
export type EmployeeStatus = 'WORKING' | 'TERMINATED';
export type EmployeeType = 'FULL_TIME' | 'PART_TIME';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type AttendanceStatus =
  | 'ON_TIME'
  | 'LATE'
  | 'MISSED_CHECKIN'
  | 'MISSED_CHECKOUT'
  | 'NOT_YET'
  | 'PENDING_APPROVAL'
  | 'ON_LEAVE';

export interface Session {
  id: string;
  platform: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastSeenAt: string;
  isCurrent: boolean;
}

export interface Branch {
  id: string;
  name: string;
  address: string | null;
  wifiSsid: string | null;
  wifiBssid: string | null;
  status: RecordStatus;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  status: RecordStatus;
}

export interface Position {
  id: string;
  name: string;
  description: string | null;
  accessScopes: string[];
  status: RecordStatus;
}

export interface Level {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  status: RecordStatus;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  appliesToAllDepartments: boolean;
  status: RecordStatus;
  departments: { department: Department }[];
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  employeeType: EmployeeType;
  salaryRate: number | null;
  status: EmployeeStatus;
  branch: Branch;
  department: Department;
  position: Position;
  level: Level | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  permanentAddress: string | null;
  currentAddress: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  idNumber: string | null;
  idIssueDate: string | null;
  idIssuePlace: string | null;
  idFrontImageKey: string | null;
  idBackImageKey: string | null;
  idFrontImageUrl: string | null;
  idBackImageUrl: string | null;
  hireDate: string | null;
  createdAt: string;
}

export interface Schedule {
  id: string;
  date: string;
  shift: Shift;
  employee: Employee;
}

export interface Attendance {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  employee: Employee;
}

export interface News {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  content: string | null;
  viewCount: number;
  status: RecordStatus;
  branch: Branch | null;
  department: Department | null;
}

export type EvaluationSection =
  | 'RECENT_TEST'
  | 'MANAGER_REVIEW'
  | 'SUPERVISOR_REVIEW'
  | 'SURPRISE_INSPECTION'
  | 'DIRECT_INTERVIEW'
  | 'STORE_ENGAGEMENT';
export type AttachmentType = 'IMAGE' | 'VIDEO';

export interface EvaluationAttachment {
  id: string;
  section: EvaluationSection;
  type: AttachmentType;
  key: string;
  url: string;
}

export interface EvaluationForm {
  id: string;
  employeeId: string;
  employee: Employee;
  createdAt: string;
  shiftsWorkedInMonth: number | null;
  lateMinutesInMonth: number | null;
  shiftChangeCount: number | null;
  missedCheckInOutCount: number | null;
  disciplinaryReportCount: number | null;
  recentTestNote: string | null;
  managerReviewText: string | null;
  supervisorReviewText: string | null;
  surpriseInspectionText: string | null;
  interviewText: string | null;
  storeEngagementText: string | null;
  attachments: EvaluationAttachment[];
}

export type EmployeeGroupScope = 'ALL' | 'FULL_TIME' | 'PART_TIME' | 'SPECIFIC';

export interface Notification {
  id: string;
  title: string;
  content: string;
  appliesToAllBranches: boolean;
  appliesToAllDepartments: boolean;
  employeeGroupScope: EmployeeGroupScope;
  status: RecordStatus;
  branches: { branch: Branch }[];
  departments: { department: Department }[];
  specificEmployees: { employee: Employee }[];
}
