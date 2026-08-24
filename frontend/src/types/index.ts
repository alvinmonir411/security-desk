export type RoleType = 'SECURITY_GUARD' | 'SUPERVISOR' | 'MANAGER' | 'AGM' | 'DGM' | 'ADMIN';

export type GuardStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'RESERVE';

export type RosterStatus = 'DRAFT' | 'GENERATED' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'LOCKED';

export type AssignmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'REPLACED' | 'CANCELLED';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE' | 'WEEKLY_OFF' | 'REPLACED';

export interface SecurityGuard {
  id: string;
  userId: string;
  badgeNumber: string;
  bloodGroup: string | null;
  joiningDate: string;
  status: GuardStatus;
  defaultLocationId: string | null;
  accumulatedDutyHours: number;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: RoleType;
  };
}

export interface LocationPost {
  id: string;
  name: string;
  code: string;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  type: string;
  address: string;
  isActive: boolean;
  posts: LocationPost[];
}

export interface Shift {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  crossesMidnight: boolean;
}

export interface LocationRequirement {
  id: string;
  date: string;
  locationId: string;
  location: Location;
  shiftId: string;
  shift: Shift;
  requiredGuards: number;
  notes?: string;
}

export interface RosterAssignment {
  id: string;
  rosterId: string;
  guardId: string;
  guard: SecurityGuard;
  locationId: string;
  location: Location;
  postId?: string | null;
  post?: LocationPost | null;
  shiftId: string;
  shift: Shift;
  date: string;
  status: AssignmentStatus;
  isOverride: boolean;
  overrideReason?: string;
}

export interface Roster {
  id: string;
  date: string;
  status: RosterStatus;
  totalRequired: number;
  totalAssigned: number;
  totalShortage: number;
  publishedAt?: string | null;
  lockedAt?: string | null;
  assignments: RosterAssignment[];
}

export interface LeaveRequest {
  id: string;
  guardId: string;
  guard: SecurityGuard;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'SUPERVISOR_REVIEWED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approvalNotes?: string;
}
