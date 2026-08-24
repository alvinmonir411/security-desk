'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';

export type RoleType = 'SECURITY_GUARD' | 'SUPERVISOR' | 'MANAGER' | 'AGM' | 'DGM';
export type PostType = 'FIXED' | 'ROTATING';

export interface SystemPost {
  id: string;
  locationId: string;
  name: string;
  requiredDay: number;
  requiredNight: number;
  postType: PostType;
}

export interface SystemLocation {
  id: string;
  name: string;
  address: string;
  type: string;
  supervisorName: string;
  distanceKm: number;
  posts: SystemPost[];
}

export interface GuardProfile {
  id: string;
  name: string;
  badgeNumber: string;
  phone: string;
  nid: string;
  address: string;
  joiningDate: string;
  bloodGroup: string;
  defaultLocationId: string;
  fixedPostId: string | null;
  status: 'ACTIVE' | 'ON_LEAVE' | 'ABSENT' | 'INACTIVE';
  dutyStreak: number;
  weeklyHours: number;
  monthlyHours: number;
  nightCountThisWeek: number;
  qualifications: string[];
}

export interface Assignment {
  id: string;
  guardId: string;
  locationId: string;
  postId: string;
  shift: 'DAY' | 'NIGHT';
  date: string;
  status: 'confirmed' | 'removed';
}

export interface LeaveReq {
  id: string;
  guardId: string;
  guardName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface OvertimeReq {
  id: string;
  guardId: string;
  guardName: string;
  postId: string;
  postName?: string;
  locationName?: string;
  date: string;
  shift: 'DAY' | 'NIGHT';
  hours: number;
  reason?: string;
  requestedBy: string;
  approvedBy?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: RoleType;
  title: string;
}

export interface ToastItem {
  id: string;
  message: string;
  undoAction?: () => void;
}

interface RosterContextType {
  currentDate: string;
  setCurrentDate: (date: string) => void;
  prevDay: () => void;
  nextDay: () => void;
  goToToday: () => void;

  currentUser: UserSession | null;
  currentRole: RoleType;
  setCurrentRole: (role: RoleType) => void;
  loginUser: (role: RoleType, email?: string, password?: string) => void;
  logoutUser: () => void;

  locations: SystemLocation[];
  addLocation: (loc: Omit<SystemLocation, 'id' | 'posts'>) => Promise<void>;
  updateLocation: (id: string, loc: Partial<SystemLocation>) => void;
  deleteLocation: (id: string) => Promise<void>;

  addPost: (locationId: string, post: Omit<SystemPost, 'id' | 'locationId'>) => Promise<void>;
  updatePost: (locationId: string, postId: string, post: Partial<SystemPost>) => void;
  deletePost: (locationId: string, postId: string) => Promise<void>;

  guards: GuardProfile[];
  addGuard: (guard: Omit<GuardProfile, 'id' | 'badgeNumber' | 'dutyStreak' | 'weeklyHours' | 'monthlyHours' | 'nightCountThisWeek'>) => Promise<void>;
  updateGuardFixedPost: (guardId: string, fixedPostId: string | null) => Promise<void>;

  assignments: Assignment[];
  assignGuardToPost: (guardId: string, locationId: string, postId: string, shift: 'DAY' | 'NIGHT') => Promise<void>;
  removeAssignment: (assignmentId: string) => Promise<void>;
  autoFixPost: (locationId: string, postId: string) => Promise<void>;
  autoFixLocation: (locationId: string) => Promise<void>;
  autoFixAll: () => Promise<void>;

  leaveRequests: LeaveReq[];
  approveLeave: (id: string) => Promise<void>;
  rejectLeave: (id: string, reason: string) => Promise<void>;

  overtimeRequests: OvertimeReq[];
  requestOvertime: (guardId: string, postId: string, shift: 'DAY' | 'NIGHT', hours?: number, reason?: string) => Promise<void>;
  approveOvertime: (id: string) => Promise<void>;
  rejectOvertime: (id: string) => Promise<void>;

  kpi: {
    workforce: number;
    required: number;
    assigned: number;
    shortage: number;
    reserve: number;
    overstaffed: number;
  };

  calculateScore: (guard: GuardProfile, location: SystemLocation, post: SystemPost, shift: 'DAY' | 'NIGHT') => number;

  toasts: ToastItem[];
  showToast: (msg: string, undoAction?: () => void) => void;
  removeToast: (id: string) => void;

  activeNav: string;
  setActiveNav: (nav: string) => void;
  selectedLocationFilter: string;
  setSelectedLocationFilter: (filter: string) => void;
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

const RosterContext = createContext<RosterContextType | undefined>(undefined);

export const RosterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>({
    id: 'USR-MGR-01',
    email: 'manager@shieldops.com',
    name: 'Md. Imran Hossain',
    role: 'MANAGER',
    title: 'Operations Manager',
  });
  const [currentRole, setCurrentRole] = useState<RoleType>('MANAGER');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState('ALL');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>('2026-08-24');
  const [locations, setLocations] = useState<SystemLocation[]>([]);
  const [guards, setGuards] = useState<GuardProfile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveReq[]>([]);
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeReq[]>([]);

  const loginUser = (role: RoleType, email?: string, password?: string) => {
    const roleProfiles: Record<RoleType, { name: string; email: string; title: string }> = {
      DGM: { name: 'Brig. Gen. (Retd) Anwar Hossain', email: 'dgm@shieldops.com', title: 'Deputy General Manager (Chief Security)' },
      AGM: { name: 'Major (Retd) M. A. Jalil', email: 'agm@shieldops.com', title: 'Assistant General Manager (Operations)' },
      MANAGER: { name: 'Md. Imran Hossain', email: 'manager@shieldops.com', title: 'Security Operations Manager' },
      SUPERVISOR: { name: 'Md. Delwar Hossain', email: 'supervisor@shieldops.com', title: 'Senior Field Supervisor' },
      SECURITY_GUARD: { name: 'Abdul Mahfuz Islam', email: 'guard@shieldops.com', title: 'Senior Security Guard (G-001)' },
    };

    const prof = roleProfiles[role];
    setCurrentUser({
      id: `USR-${role}-01`,
      email: email || prof.email,
      name: prof.name,
      role,
      title: prof.title,
    });
    setCurrentRole(role);
    showToast(`Logged in as ${prof.name} (${role})`);
  };

  const logoutUser = () => {
    setCurrentUser(null);
    showToast('Logged out successfully.');
  };

  // Fetch all live data from Neon Postgres via Next.js API routes
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);

      // 1. Fetch Locations & Posts
      const locRes = await fetch('/api/locations');
      const locJson = await locRes.json();
      if (locJson.success && locJson.data) {
        const mappedLocations: SystemLocation[] = locJson.data.map((l: any, idx: number) => ({
          id: l.id,
          name: l.name,
          address: l.address || 'Industrial Area',
          type: 'Site',
          supervisorName: l.supervisorId ? `Supervisor (${l.supervisorId})` : 'Md. Delwar Hossain',
          distanceKm: 5 + (idx * 4),
          posts: (l.posts || []).map((p: any) => ({
            id: p.id,
            locationId: l.id,
            name: p.name,
            requiredDay: p.requiredDay,
            requiredNight: p.requiredNight,
            postType: p.type === 'FIXED' ? 'FIXED' : 'ROTATING',
          })),
        }));
        setLocations(mappedLocations);
      }

      // 2. Fetch Guards
      const guardRes = await fetch('/api/guards');
      const guardJson = await guardRes.json();
      if (guardJson.success && guardJson.data) {
        const bloods = ['A+', 'B+', 'O+', 'AB+', 'O-', 'A-'];
        const mappedGuards: GuardProfile[] = guardJson.data.map((g: any, i: number) => ({
          id: g.id,
          name: g.name,
          badgeNumber: `G-${String(i + 1).padStart(3, '0')}`,
          phone: g.phone || '+880 1700000000',
          nid: g.nid || `1998${i}`,
          address: g.address || 'Dhaka',
          joiningDate: g.joinDate ? g.joinDate.split('T')[0] : '2023-03-15',
          bloodGroup: bloods[i % bloods.length],
          defaultLocationId: g.fixedPost?.locationId || 'LOC-1',
          fixedPostId: g.fixedPostId,
          status: g.status as 'ACTIVE' | 'ON_LEAVE' | 'ABSENT' | 'INACTIVE',
          dutyStreak: (i % 6) + 1,
          weeklyHours: 36 + (i % 4) * 12,
          monthlyHours: 120 + (i % 15) * 6,
          nightCountThisWeek: i % 4,
          qualifications: ['Gate Security', 'CCTV Monitoring', 'Fire Safety'],
        }));
        setGuards(mappedGuards);
      }

      // 3. Fetch Assignments for currentDate
      const asgRes = await fetch(`/api/assignments?date=${currentDate}`);
      const asgJson = await asgRes.json();
      if (asgJson.success && asgJson.data) {
        const mappedAssignments: Assignment[] = asgJson.data.map((a: any) => ({
          id: a.id,
          guardId: a.guardId,
          locationId: a.post?.locationId || 'LOC-1',
          postId: a.postId,
          shift: a.shift,
          date: currentDate,
          status: a.status === 'CONFIRMED' ? 'confirmed' : 'removed',
        }));
        setAssignments(mappedAssignments);
      }

      // 4. Fetch Leave Requests
      const leaveRes = await fetch('/api/leave');
      const leaveJson = await leaveRes.json();
      if (leaveJson.success && leaveJson.data) {
        const mappedLeaves: LeaveReq[] = leaveJson.data.map((l: any) => ({
          id: l.id,
          guardId: l.guardId,
          guardName: l.guard?.name || 'Guard',
          startDate: l.startDate.split('T')[0],
          endDate: l.endDate.split('T')[0],
          reason: l.type,
          status: l.status,
        }));
        setLeaveRequests(mappedLeaves);
      }

      // 5. Fetch Overtime Requests
      const otRes = await fetch('/api/overtime');
      const otJson = await otRes.json();
      if (otJson.success && otJson.data) {
        const mappedOT: OvertimeReq[] = otJson.data.map((ot: any) => ({
          id: ot.id,
          guardId: ot.guardId,
          guardName: ot.guard?.name || 'Guard',
          postId: ot.postId,
          date: ot.date ? ot.date.split('T')[0] : currentDate,
          shift: ot.shift,
          hours: ot.hours || 12,
          reason: ot.reason,
          requestedBy: ot.requestedBy,
          approvedBy: ot.approvedBy,
          status: ot.status,
          createdAt: ot.createdAt,
        }));
        setOvertimeRequests(mappedOT);
      }
    } catch (err) {
      console.error('Error fetching database data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const prevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  };
  const nextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  };
  const goToToday = () => {
    setCurrentDate('2026-08-24');
  };

  const showToast = (message: string, undoAction?: () => void) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, undoAction }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Exact Score Calculation formula from Spec
  const calculateScore = (guard: GuardProfile, location: SystemLocation, post: SystemPost, shift: 'DAY' | 'NIGHT'): number => {
    const avgHours = 48;
    const dutyStreakPenalty = guard.dutyStreak * 5;
    const weeklyHoursDiff = (guard.weeklyHours - avgHours) / 2;
    const nightPenalty = guard.nightCountThisWeek * 2;
    const postMatchBonus = guard.fixedPostId === post.id ? 15 : 0;
    const locationMatchBonus = guard.defaultLocationId === location.id ? 8 : 0;
    const fixedElsewherePenalty = guard.fixedPostId && guard.fixedPostId !== post.id ? 20 : 0;
    const distancePenalty = location.distanceKm * 1;

    let score = 100 - dutyStreakPenalty - weeklyHoursDiff - nightPenalty + postMatchBonus + locationMatchBonus - fixedElsewherePenalty - distancePenalty;
    return Math.max(10, Math.min(99, Math.round(score)));
  };

  // Live KPIs from database entities
  const kpi = useMemo(() => {
    const activeGuards = guards.filter((g) => g.status === 'ACTIVE');
    const workforce = activeGuards.length;

    let required = 0;
    locations.forEach((loc) => {
      loc.posts.forEach((p) => {
        required += p.requiredDay + p.requiredNight;
      });
    });

    const activeAssignments = assignments.filter(
      (a) => a.date === currentDate && a.status === 'confirmed'
    );
    const assigned = activeAssignments.length;
    const shortage = Math.max(0, required - assigned);
    const overstaffed = Math.max(0, assigned - required);

    const offCount = activeGuards.filter((g) => g.dutyStreak === 6).length;
    const leaveCount = guards.filter((g) => g.status === 'ON_LEAVE').length;
    const absentCount = guards.filter((g) => g.status === 'ABSENT').length;

    const reserve = Math.max(0, workforce - assigned - offCount - leaveCount - absentCount);

    return {
      workforce,
      required,
      assigned,
      shortage,
      reserve,
      overstaffed,
    };
  }, [guards, locations, assignments, currentDate]);

  // Database-backed Persistent Actions
  const assignGuardToPost = async (guardId: string, locationId: string, postId: string, shift: 'DAY' | 'NIGHT') => {
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guardId, postId, shift, date: currentDate }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const newAsg: Assignment = {
          id: data.data.id,
          guardId,
          locationId,
          postId,
          shift,
          date: currentDate,
          status: 'confirmed',
        };
        setAssignments((prev) => [...prev.filter((a) => !(a.guardId === guardId && a.date === currentDate)), newAsg]);

        const guard = guards.find((g) => g.id === guardId);
        const post = locations.flatMap((l) => l.posts).find((p) => p.id === postId);

        showToast(
          `${guard?.name || 'Guard'} assigned to ${post?.name || 'Post'} (${shift}).`,
          async () => {
            await fetch(`/api/assignments?id=${newAsg.id}`, { method: 'DELETE' });
            setAssignments((prev) => prev.filter((a) => a.id !== newAsg.id));
          }
        );
      }
    } catch (err) {
      console.error('Error assigning guard in DB:', err);
    }
  };

  const removeAssignment = async (assignmentId: string) => {
    try {
      const asg = assignments.find((a) => a.id === assignmentId);
      if (!asg) return;

      const guard = guards.find((g) => g.id === asg.guardId);
      const post = locations.flatMap((l) => l.posts).find((p) => p.id === asg.postId);

      await fetch(`/api/assignments?id=${assignmentId}`, { method: 'DELETE' });
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));

      showToast(
        `Removed ${guard?.name} from ${post?.name} (${asg.shift}).`,
        async () => {
          await fetch('/api/assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guardId: asg.guardId, postId: asg.postId, shift: asg.shift, date: asg.date }),
          });
          setAssignments((prev) => [...prev, asg]);
        }
      );
    } catch (err) {
      console.error('Error removing assignment from DB:', err);
    }
  };

  const autoFixPost = async (locationId: string, postId: string) => {
    try {
      const res = await fetch('/api/roster/auto-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: currentDate, locationId, postId }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast(data.message || 'Post shortage auto-filled.');
      }
    } catch (err) {
      console.error('Error auto-fixing post:', err);
    }
  };

  const autoFixLocation = async (locationId: string) => {
    try {
      const res = await fetch('/api/roster/auto-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: currentDate, locationId }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast(data.message || 'Location shortages auto-resolved.');
      }
    } catch (err) {
      console.error('Error auto-fixing location:', err);
    }
  };

  const autoFixAll = async () => {
    try {
      const res = await fetch('/api/roster/auto-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: currentDate }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast(data.message || 'All shortages auto-resolved on Neon Database!');
      }
    } catch (err) {
      console.error('Error auto-fixing all:', err);
    }
  };

  const addLocation = async (locData: Omit<SystemLocation, 'id' | 'posts'>) => {
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: locData.name,
          address: locData.address,
          supervisorId: locData.supervisorName,
          posts: [{ name: 'Main Security Gate', requiredDay: 1, requiredNight: 1, type: 'FIXED' }],
        }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast(`Location "${locData.name}" created in Postgres.`);
      }
    } catch (err) {
      console.error('Error creating location:', err);
    }
  };

  const updateLocation = (id: string, locData: Partial<SystemLocation>) => {
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...locData } : l)));
    showToast('Location updated.');
  };

  const deleteLocation = async (id: string) => {
    try {
      await fetch(`/api/locations?id=${id}`, { method: 'DELETE' });
      await refreshData();
      showToast('Location deleted from database.');
    } catch (err) {
      console.error('Error deleting location:', err);
    }
  };

  const addPost = async (locationId: string, postData: Omit<SystemPost, 'id' | 'locationId'>) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          name: postData.name,
          requiredDay: postData.requiredDay,
          requiredNight: postData.requiredNight,
          type: postData.postType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast(`Post "${postData.name}" created in database.`);
      }
    } catch (err) {
      console.error('Error adding post:', err);
    }
  };

  const updatePost = (locationId: string, postId: string, postData: Partial<SystemPost>) => {
    setLocations((prev) =>
      prev.map((l) =>
        l.id === locationId
          ? {
              ...l,
              posts: l.posts.map((p) => (p.id === postId ? { ...p, ...postData } : p)),
            }
          : l
      )
    );
    showToast('Post requirements updated.');
  };

  const deletePost = async (locationId: string, postId: string) => {
    try {
      await fetch(`/api/posts?id=${postId}`, { method: 'DELETE' });
      await refreshData();
      showToast('Post removed from database.');
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const addGuard = async (guardData: Omit<GuardProfile, 'id' | 'badgeNumber' | 'dutyStreak' | 'weeklyHours' | 'monthlyHours' | 'nightCountThisWeek'>) => {
    try {
      const res = await fetch('/api/guards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: guardData.name,
          phone: guardData.phone,
          nid: guardData.nid,
          address: guardData.address,
          fixedPostId: guardData.fixedPostId,
          status: guardData.status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast(`Guard ${guardData.name} enrolled into database.`);
      }
    } catch (err) {
      console.error('Error adding guard:', err);
    }
  };

  const updateGuardFixedPost = async (guardId: string, fixedPostId: string | null) => {
    try {
      await fetch('/api/guards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: guardId, fixedPostId }),
      });
      await refreshData();
      showToast(fixedPostId ? 'Guard assigned to Fixed Post in database.' : 'Guard converted to Rotating in database.');
    } catch (err) {
      console.error('Error updating guard post:', err);
    }
  };

  const approveLeave = async (id: string) => {
    try {
      await fetch('/api/leave', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'APPROVED' }),
      });
      await refreshData();
      showToast('Leave approved & guard marked unavailable in database.');
    } catch (err) {
      console.error('Error approving leave:', err);
    }
  };

  const rejectLeave = async (id: string, reason: string) => {
    try {
      await fetch('/api/leave', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'REJECTED' }),
      });
      await refreshData();
      showToast('Leave request rejected in database.');
    } catch (err) {
      console.error('Error rejecting leave:', err);
    }
  };

  const requestOvertime = async (
    guardId: string,
    postId: string,
    shift: 'DAY' | 'NIGHT',
    hours: number = 12,
    reason?: string
  ) => {
    try {
      const res = await fetch('/api/overtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardId,
          postId,
          shift,
          hours,
          date: currentDate,
          reason: reason || 'Emergency deployment on scheduled weekly rest day',
          requestedBy: currentUser?.title || currentRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast(`⚡ Overtime request submitted for AGM/DGM approval!`);
      } else {
        showToast(`Request failed: ${data.error}`);
      }
    } catch (err: any) {
      console.error('Error submitting overtime request:', err);
      showToast(`Error: ${err.message}`);
    }
  };

  const approveOvertime = async (id: string) => {
    try {
      const res = await fetch('/api/overtime', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action: 'APPROVE',
          approvedBy: currentUser?.name || `${currentRole} Approver`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast(`✅ Overtime approved & guard deployed to post!`);
      }
    } catch (err: any) {
      console.error('Error approving overtime:', err);
      showToast(`Error: ${err.message}`);
    }
  };

  const rejectOvertime = async (id: string) => {
    try {
      const res = await fetch('/api/overtime', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action: 'REJECT',
          approvedBy: currentUser?.name || `${currentRole} Reviewer`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast('Overtime request rejected.');
      }
    } catch (err: any) {
      console.error('Error rejecting overtime:', err);
      showToast(`Error: ${err.message}`);
    }
  };

  return (
    <RosterContext.Provider
      value={{
        currentDate,
        setCurrentDate,
        prevDay,
        nextDay,
        goToToday,
        currentUser,
        currentRole,
        setCurrentRole,
        loginUser,
        logoutUser,
        locations,
        addLocation,
        updateLocation,
        deleteLocation,
        addPost,
        updatePost,
        deletePost,
        guards,
        addGuard,
        updateGuardFixedPost,
        assignments,
        assignGuardToPost,
        removeAssignment,
        autoFixPost,
        autoFixLocation,
        autoFixAll,
        leaveRequests,
        approveLeave,
        rejectLeave,
        overtimeRequests,
        requestOvertime,
        approveOvertime,
        rejectOvertime,
        kpi,
        calculateScore,
        toasts,
        showToast,
        removeToast,
        activeNav,
        setActiveNav,
        selectedLocationFilter,
        setSelectedLocationFilter,
        refreshData,
        isLoading,
      }}
    >
      {children}
    </RosterContext.Provider>
  );
};

export const useRoster = () => {
  const context = useContext(RosterContext);
  if (!context) throw new Error('useRoster must be used within a RosterProvider');
  return context;
};
