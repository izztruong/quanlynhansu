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

export interface PermissionScopeOption {
  /** null = mức hẹp nhất, biểu diễn bằng việc không lưu mã nào. */
  code: string | null;
  label: string;
}

export interface PermissionResource {
  resource: string;
  label: string;
  /** Chỉ chức năng nào có phạm vi dữ liệu mới kèm mảng này. */
  scopes?: PermissionScopeOption[];
}

export interface Position {
  id: string;
  name: string;
  description: string | null;
  accessScopes: string[];
  status: RecordStatus;
  /** Chức vụ hệ thống (Chủ thương hiệu): luôn toàn quyền, không sửa/xoá được. */
  isSystem: boolean;
  /** Mã quyền dạng RESOURCE.ACTION, vd "EMPLOYEES.ADD". */
  permissions: string[];
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
  capabilitySalary: number | null;
  workedHours: number | null;
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

export type EvaluationSection = 'WORK_ATTITUDE' | 'PROFESSIONAL_COMPETENCE' | 'TEAM_ENGAGEMENT';
export type EvaluationInputType = 'NUMBER' | 'TEXT';
export type AttachmentType = 'IMAGE' | 'VIDEO';

export interface EvaluationCriteria {
  id: string;
  section: EvaluationSection;
  name: string;
  inputType: EvaluationInputType;
  allowAttachment: boolean;
  order: number;
  status: RecordStatus;
}

export interface EvaluationAnswer {
  id: string;
  criteriaId: string;
  criteria: EvaluationCriteria;
  numberValue: number | null;
  textValue: string | null;
}

export interface EvaluationAttachment {
  id: string;
  criteriaId: string;
  criteria: EvaluationCriteria;
  type: AttachmentType;
  key: string;
  url: string;
}

export interface EvaluationForm {
  id: string;
  employeeId: string;
  employee: Employee;
  createdAt: string;
  answers: EvaluationAnswer[];
  attachments: EvaluationAttachment[];
}

export type TrainingLogStatus = 'IN_PROGRESS' | 'COMPLETED';

export interface TrainingCriteria {
  id: string;
  groupId: string;
  name: string;
  maxScore: number;
  order: number;
  status: RecordStatus;
}

export interface TrainingCriteriaGroup {
  id: string;
  departmentId: string;
  department: Department;
  name: string;
  order: number;
  status: RecordStatus;
  criteria: TrainingCriteria[];
}

export interface TrainingSession {
  id: string;
  sessionNumber: number;
  sessionDate: string | null;
  learnedContent: string | null;
  assignedTasks: string | null;
  evalAppearance: string | null;
  evalCommunication: string | null;
  evalPractice: string | null;
}

export interface TrainingScore {
  id: string;
  criteriaId: string | null;
  groupName: string;
  criteriaName: string;
  maxScore: number;
  score: number;
  note: string | null;
}

export interface TrainingLog {
  id: string;
  employeeId: string;
  employee: Employee;
  branch: Branch;
  department: Department;
  mentor: Employee | null;
  startDate: string | null;
  endDate: string | null;
  status: TrainingLogStatus;
  overallOpinion: string | null;
  createdBy: Employee | null;
  createdAt: string;
  sessions: TrainingSession[];
  scores: TrainingScore[];
}

export interface WorkReviewSection {
  id: string;
  name: string;
  order: number;
  status: RecordStatus;
}

export interface WorkReviewNote {
  id: string;
  sectionId: string | null;
  sectionName: string;
  content: string;
  order: number;
}

export interface WorkReview {
  id: string;
  employeeId: string;
  employee: Employee;
  weekStartDate: string;
  reviewer: Employee | null;
  score: number;
  maxScore: number;
  createdBy: Employee | null;
  createdAt: string;
  notes: WorkReviewNote[];
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
