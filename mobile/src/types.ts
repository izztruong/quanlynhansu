export type RecordStatus = 'ACTIVE' | 'INACTIVE';
export type EmployeeStatus = 'WORKING' | 'TERMINATED';
export type EmployeeType = 'FULL_TIME' | 'PART_TIME';
export type AttendanceStatus =
  | 'ON_TIME'
  | 'LATE'
  | 'MISSED_CHECKIN'
  | 'MISSED_CHECKOUT'
  | 'NOT_YET'
  | 'PENDING_APPROVAL'
  | 'ON_LEAVE';

export interface Branch {
  id: string;
  name: string;
  address: string | null;
  wifiSsid: string | null;
  wifiBssid: string | null;
}

export interface Department {
  id: string;
  name: string;
}

export interface Position {
  id: string;
  name: string;
}

export interface Level {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  employeeType: EmployeeType;
  status: EmployeeStatus;
  branch: Branch;
  department: Department;
  position: Position;
  level: Level | null;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface Schedule {
  id: string;
  date: string;
  shift: Shift;
}

export interface Attendance {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  shift: Shift | null;
}

export interface News {
  id: string;
  title: string;
  status: RecordStatus;
  branch: Branch | null;
  department: Department | null;
}
