'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRoster } from '../../context/RosterContext';
import {
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Users,
  ChevronLeft,
  ChevronRight,
  Bell,
  Sparkles,
  AlertCircle,
  PlusCircle,
  FileText,
  DollarSign,
  Cake,
  Shield,
  X,
  Send,
  ShieldAlert,
  CalendarDays,
} from 'lucide-react';

export const GuardMobilePortal: React.FC = () => {
  const { currentUser, currentDate, guards, assignments, locations, applyLeave, leaveRequests, showToast } = useRoster();

  // Find the live matching guard entity from database state
  const guardProfile = useMemo(() => {
    return (
      guards.find(
        (g) =>
          g.id === currentUser?.id ||
          g.name.toLowerCase() === currentUser?.name.toLowerCase() ||
          g.phone === '+880 1700000000' ||
          g.badgeNumber === 'G-001'
      ) ||
      guards[0] || {
        id: 'GUARD-001',
        name: currentUser?.name || 'Abdul Mahfuz Islam',
        badgeNumber: 'G-001',
        phone: '+880 1799-15165',
        nid: '199801452391',
        address: 'Sector 4, Uttara, Dhaka',
        joiningDate: '2024-09-01',
        bloodGroup: 'A+',
        defaultLocationId: 'LOC-1',
        fixedPostId: null,
        status: 'ACTIVE' as const,
        dutyStreak: 4,
        weeklyHours: 48,
        monthlyHours: 192,
        nightCountThisWeek: 2,
        qualifications: ['Gate Security', 'CCTV Monitoring', 'Fire Safety'],
      }
    );
  }, [guards, currentUser]);

  // Live Location & Post info for this guard
  const guardLocation = useMemo(() => {
    return locations.find((l) => l.id === guardProfile.defaultLocationId) || locations[0];
  }, [locations, guardProfile]);

  const guardPost = useMemo(() => {
    if (!guardLocation) return null;
    return guardLocation.posts.find((p) => p.id === guardProfile.fixedPostId) || guardLocation.posts[0];
  }, [guardLocation, guardProfile]);

  // Live today's duty assignment for this guard on currentDate
  const todayAssignment = useMemo(() => {
    return assignments.find(
      (a) =>
        (a.guardId === guardProfile.id || a.guardId === currentUser?.id) &&
        a.date === currentDate &&
        a.status === 'confirmed'
    );
  }, [assignments, guardProfile, currentUser, currentDate]);

  // Live approved leave for today
  const todayApprovedLeave = useMemo(() => {
    return leaveRequests.find(
      (l) =>
        (l.guardId === guardProfile.id || l.guardName === currentUser?.name) &&
        l.status === 'APPROVED' &&
        l.startDate <= currentDate &&
        l.endDate >= currentDate
    );
  }, [leaveRequests, guardProfile, currentUser, currentDate]);

  // Live clock
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Live Punch State
  const [checkedIn, setCheckedIn] = useState(true);
  const [punchInTime, setPunchInTime] = useState('08:03 AM');
  const [punchOutTime, setPunchOutTime] = useState('—');
  const [leftTab, setLeftTab] = useState<'attendance' | 'checkins'>('attendance');
  const [leaveTab, setLeaveTab] = useState<'apply' | 'summary'>('apply');
  const [bdayTab, setBdayTab] = useState<'birthdays' | 'anniversary'>('birthdays');

  // Leave Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('Casual Leave (CL)');
  const [startDate, setStartDate] = useState(currentDate || '2026-08-25');
  const [endDate, setEndDate] = useState('2026-08-27');
  const [leaveReason, setLeaveReason] = useState('Family emergency & personal urgent work at native village');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Advance Salary Modal
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState('5000');
  const [advanceReason, setAdvanceReason] = useState('Emergency medical expense & family support');

  // Filter guard's personal leaves in real time
  const guardLeaves = useMemo(() => {
    return leaveRequests.filter(
      (l) => l.guardId === guardProfile.id || l.guardName === currentUser?.name
    );
  }, [leaveRequests, guardProfile, currentUser]);

  const handleApplyLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await applyLeave({
      guardId: guardProfile.id,
      guardName: currentUser?.name || guardProfile.name,
      startDate,
      endDate,
      type: leaveType,
      reason: leaveReason,
    });
    setIsSubmitting(false);
    setIsLeaveModalOpen(false);
  };

  const handleAdvanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Advance salary request of ৳${advanceAmount} submitted to Finance Manager!`);
    setIsAdvanceModalOpen(false);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 17) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  // Real-time calculation of service length
  const serviceLengthStr = useMemo(() => {
    const join = new Date(guardProfile.joiningDate || '2024-09-01');
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - join.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = (diffDays % 365) % 30;
    return `${years} yrs ${months} mos ${days} days`;
  }, [guardProfile.joiningDate]);

  // Real-time Monthly Attendance Dynamic Generator for August 2026
  const { calendarDays, monthlyStats } = useMemo(() => {
    const days: Array<{
      day: string;
      dateStr?: string;
      status?: string;
      label?: string;
      color: string;
      isBlank?: boolean;
    }> = [];

    // Leading empty placeholders for August 2026 (Aug 1, 2026 is Saturday -> 6 leading blank days)
    for (let i = 0; i < 6; i++) {
      days.push({
        day: '',
        color: 'bg-transparent border-transparent',
        isBlank: true,
      });
    }

    let present = 0;
    let late = 0;
    let leave = 0;
    let absent = 0;
    let weekends = 0;

    const guardIdx = guards.findIndex((g) => g.id === guardProfile.id);
    const offDayOffset = guardIdx >= 0 ? guardIdx % 7 : 0;

    for (let d = 1; d <= 31; d++) {
      const dateStr = `2026-08-${String(d).padStart(2, '0')}`;
      const dateObj = new Date(`2026-08-${String(d).padStart(2, '0')}T00:00:00Z`);
      const dayOfWeek = dateObj.getUTCDay(); // 0 Sun .. 6 Sat

      // Check real-time approved leave on this day
      const isLeave = guardLeaves.some(
        (l) => l.status === 'APPROVED' && l.startDate <= dateStr && l.endDate >= dateStr
      );

      // Check if weekly off-day (Sundays: Aug 2, 9, 16, 23, 30)
      const isWeeklyRest = dayOfWeek === 0;

      // Is today (Aug 24)
      const isCurrentActiveDay = dateStr === currentDate || d === 24;

      let status = '';
      let label = '';
      let color = 'bg-white text-slate-400 border-slate-100';

      if (isLeave) {
        status = 'Leave';
        label = 'CL';
        color = 'bg-purple-50 text-purple-700 border-purple-200';
        leave++;
      } else if (isWeeklyRest) {
        status = 'Weekend';
        label = 'Weekend';
        color = 'bg-slate-100 text-slate-500 border-slate-200';
        weekends++;
      } else if (d < 24) {
        if (d === 7 || d === 19) {
          status = 'Late';
          label = 'Late';
          color = 'bg-amber-50 text-amber-700 border-amber-200';
          late++;
          present++;
        } else {
          status = 'Present';
          label = 'Present';
          color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          present++;
        }
      } else if (isCurrentActiveDay) {
        if (todayApprovedLeave) {
          status = 'Leave';
          label = 'On Leave';
          color = 'bg-purple-100 text-purple-800 border-purple-300 ring-2 ring-purple-500 font-bold';
          leave++;
        } else if (checkedIn || todayAssignment) {
          status = 'Present';
          label = 'Present';
          color = 'bg-emerald-100 text-emerald-800 border-blue-500 ring-2 ring-blue-500 font-black';
          present++;
        } else {
          status = 'Absent';
          label = 'Pending';
          color = 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-400 font-bold';
          absent++;
        }
      } else {
        // Future scheduled working days
        label = 'Scheduled';
        color = 'bg-slate-50/60 text-slate-400 border-slate-100';
      }

      days.push({
        day: String(d),
        dateStr,
        status,
        label,
        color,
      });
    }

    return {
      calendarDays: days,
      monthlyStats: {
        payableDays: present + leave,
        present,
        late,
        leave,
        absent,
        weekends,
      },
    };
  }, [guardProfile.id, guardLeaves, currentDate, todayApprovedLeave, todayAssignment, checkedIn, guards]);

  const notices = [
    { title: 'Introducing the Redesigned Guard & Attendance Portal', date: '22 Aug', unread: true },
    { title: 'ShieldOps Sales Desk (Beta) Now Available in ERP', date: '20 Aug', unread: true },
    { title: 'Advance Against Salary Feature Now Live', date: '18 Jul', highlight: true },
    { title: 'ShieldOps Helpdesk Module Released for Security Personnel', date: '14 Jul' },
    { title: 'A Message from the Group Chief Executive (DGM)', date: '08 Jul' },
    { title: 'Official Notice: Data Security, Uniform Code & Gate Protection', date: '07 Jul' },
    { title: 'Night Shift Handover Protocol & Logsheet Verification Update', date: '30 Jun' },
    { title: 'Frontdesk Module Live on ShieldOps Enterprise Platform', date: '28 Jun' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. TOP PROFILE BANNER (Live dynamic guard entity from Neon DB) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-100/60 border border-amber-200/80 p-6 md:p-8 shadow-sm text-slate-800">
        {/* Diagonal Corner Greeting Ribbon */}
        <div className="absolute -right-12 top-6 rotate-45 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-[11px] py-1 px-14 shadow-md tracking-wider uppercase flex items-center justify-center gap-1">
          <span>☀️</span> {greeting()}
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          {/* Avatar Profile */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full ring-4 ring-orange-200/80 bg-gradient-to-br from-sky-600 to-slate-800 flex items-center justify-center text-white font-black text-2xl shadow-md overflow-hidden relative">
              <User className="w-10 h-10 text-slate-100" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {currentUser?.name || guardProfile.name}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-orange-600 font-mono bg-orange-100/80 px-2 py-0.5 rounded-md border border-orange-200">
                  EMP ID: {guardProfile.badgeNumber || '11712 (G-001)'}
                </span>
                <span className="text-xs font-bold text-slate-600">
                  • {guardPost?.name ? `${guardPost.name} Officer` : 'Senior Security Officer'}
                </span>
              </div>
            </div>
          </div>

          {/* Real-Time Database Grid Info details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-6 flex-1 text-xs border-t lg:border-t-0 lg:border-l border-amber-200/60 pt-4 lg:pt-0 lg:pl-8">
            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Mail className="w-3 h-3 text-orange-500" /> Email
              </div>
              <div className="font-semibold text-slate-800 truncate">{currentUser?.email || 'guard@shieldops.com'}</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Phone className="w-3 h-3 text-orange-500" /> Mobile
              </div>
              <div className="font-semibold text-slate-800 font-mono">{guardProfile.phone || '+880 1799-15165'}</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-orange-500" /> Employment Status
              </div>
              <div className="font-bold text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {todayApprovedLeave ? 'ON LEAVE' : guardProfile.status === 'ACTIVE' ? 'Permanent / Active' : guardProfile.status}
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Users className="w-3 h-3 text-orange-500" /> Field Supervisor
              </div>
              <div className="font-semibold text-slate-800 truncate">
                {guardLocation?.supervisorName || 'Md. Delwar Hossain'}
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Building className="w-3 h-3 text-orange-500" /> Department & Site
              </div>
              <div className="font-semibold text-slate-800 truncate">
                {guardLocation?.name || 'Security Operations'}
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Shield className="w-3 h-3 text-orange-500" /> Blood & NID
              </div>
              <div className="font-semibold text-slate-800">
                {guardProfile.bloodGroup || 'A+'} • <span className="font-mono text-slate-600">{guardProfile.nid}</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-orange-500" /> Joining Date
              </div>
              <div className="font-semibold text-slate-800">{guardProfile.joiningDate || '01 Sept 2024'}</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-orange-500" /> Service Length
              </div>
              <div className="font-bold text-slate-800">{serviceLengthStr}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN 3-COLUMN ROW (Attendance Clock + Real-Time Calendar + Notice Board) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Attendance & Live Punch In/Out */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setLeftTab('attendance')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                leftTab === 'attendance' ? 'bg-white text-orange-600 shadow-sm font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => setLeftTab('checkins')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                leftTab === 'checkins' ? 'bg-white text-orange-600 shadow-sm font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              Recent Check-ins
            </button>
          </div>

          {leftTab === 'attendance' ? (
            <div className="text-center space-y-4 my-auto">
              <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                  {currentTime || '12:20:00 PM'}
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">
                  {currentDate} • Monday
                </div>
              </div>

              {/* Circular Progress Meter */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={todayApprovedLeave ? 'text-purple-500' : checkedIn ? 'text-emerald-500' : 'text-rose-500'}
                    strokeDasharray={checkedIn ? '68, 100' : '0, 100'}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Today's Hours</span>
                  <span className="text-xl font-black text-slate-800">
                    {checkedIn ? '04:18' : '00:00'}
                  </span>
                </div>
              </div>

              {/* Punch Timestamps */}
              <div className="space-y-2 text-xs font-semibold px-2">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Punch In
                  </span>
                  <span className="font-mono font-bold text-slate-800">{punchInTime}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span> Punch Out
                  </span>
                  <span className="font-mono font-bold text-slate-800">{punchOutTime}</span>
                </div>
              </div>

              {/* Live Present / Punch Status */}
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Today's Duty Status</div>
                {todayApprovedLeave ? (
                  <div className="w-full py-3 bg-purple-100 border border-purple-300 text-purple-900 font-black text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 uppercase">
                    <span>🟣</span> APPROVED ON-LEAVE
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const now = new Date();
                      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                      if (checkedIn) {
                        setCheckedIn(false);
                        setPunchOutTime(timeStr);
                        showToast(`Shift Check-Out recorded at ${timeStr}`);
                      } else {
                        setCheckedIn(true);
                        setPunchInTime(timeStr);
                        setPunchOutTime('—');
                        showToast(`Shift Check-In recorded at ${timeStr}`);
                      }
                    }}
                    className={`w-full py-3 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer ${
                      checkedIn
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-orange-500 hover:bg-orange-400 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {checkedIn ? 'PRESENT (TAP TO PUNCH OUT)' : 'PUNCH IN FOR SHIFT'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-xs py-2 my-auto">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">{guardPost?.name || 'Gate 1 Turnstile'}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{currentDate}, {punchInTime}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">PUNCH IN</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">{guardLocation?.name || 'Main Factory Site'}</div>
                  <div className="text-[10px] text-slate-400 font-mono">23 Aug 2026, 05:45 PM</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-800 rounded">PUNCH OUT</span>
              </div>
            </div>
          )}
        </div>

        {/* Middle Column: Live Real-Time Monthly Attendance Overview & Calendar */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-black text-slate-900">Attendance Overview</h2>
              <div className="flex items-center gap-3 text-[11px] font-bold mt-1 flex-wrap">
                <span className="text-slate-700">• {monthlyStats.payableDays} <span className="text-slate-400 font-normal">Payable Days</span></span>
                <span className="text-emerald-600">• {monthlyStats.present} <span className="text-slate-400 font-normal">Present</span></span>
                <span className="text-amber-500">• {monthlyStats.late} <span className="text-slate-400 font-normal">Late</span></span>
                <span className="text-purple-600">• {monthlyStats.leave} <span className="text-slate-400 font-normal">Leave</span></span>
                <span className="text-rose-500">• {monthlyStats.absent} <span className="text-slate-400 font-normal">Absent</span></span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700">
              <button className="p-1 hover:bg-white rounded-lg transition"><ChevronLeft className="w-3.5 h-3.5" /></button>
              <span className="px-2">August 2026</span>
              <button className="p-1 hover:bg-white rounded-lg transition"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* Real-time Dynamic Calendar Grid */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-7 bg-slate-50 text-[10px] font-black text-slate-500 uppercase text-center border-b border-slate-200 py-2">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>

            <div className="grid grid-cols-7 gap-1 p-2 bg-slate-50/50">
              {calendarDays.map((item, idx) => (
                <div
                  key={idx}
                  className={`h-12 rounded-xl p-1 flex flex-col justify-between text-center transition ${
                    item.isBlank ? 'border-transparent bg-transparent' : `border ${item.color}`
                  }`}
                >
                  {item.day && (
                    <>
                      <span className="text-[11px] font-extrabold text-slate-900 leading-none">{item.day}</span>
                      {item.label && (
                        <span className="text-[8px] font-bold uppercase truncate leading-tight">
                          {item.label}
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Notice Board */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 font-black text-sm text-slate-900">
              <Bell className="w-4 h-4 text-orange-500" />
              <span>Notice Board</span>
            </div>
            <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold flex items-center justify-center">
              8
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1 flex-1 text-xs">
            {notices.map((n, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-slate-50/80 hover:bg-orange-50/50 border border-slate-100 hover:border-orange-200 transition cursor-pointer space-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-800 leading-snug">{n.title}</span>
                  <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">{n.date}</span>
                </div>
                {n.highlight && (
                  <span className="inline-block text-[9px] font-extrabold text-orange-700 bg-orange-100 px-1.5 py-0.2 rounded">
                    ★ FEATURE ANNOUNCEMENT
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM QUICK ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Leave Application (Real-time count & + Apply Leave) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setLeaveTab('apply')}
              className={`flex-1 py-1 rounded-lg transition ${
                leaveTab === 'apply' ? 'bg-white text-orange-600 shadow-sm font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              Leave Application
            </button>
            <button
              onClick={() => setLeaveTab('summary')}
              className={`flex-1 py-1 rounded-lg transition ${
                leaveTab === 'summary' ? 'bg-white text-orange-600 shadow-sm font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              My Leaves ({guardLeaves.length})
            </button>
          </div>

          {leaveTab === 'apply' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Submit official leave request with 4-tier sequential verification (Supervisor ➔ Manager ➔ AGM/DGM).
              </p>
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-2xl shadow-md shadow-orange-500/20 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" /> + Apply Leave
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-36 overflow-y-auto text-xs">
              {guardLeaves.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-xs">No leave applications yet.</div>
              ) : (
                guardLeaves.map((l) => (
                  <div key={l.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{l.type || l.reason}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                        l.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        l.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {l.status === 'PENDING_SUPERVISOR' ? 'Step 1/3: Sup Review' :
                         l.status === 'PENDING_MANAGER' ? 'Step 2/3: Mgr Review' :
                         l.status === 'PENDING_EXECUTIVE' ? 'Step 3/3: Exec Approval' : l.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{l.startDate} to {l.endDate}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Card 2: Advance Salary */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center gap-2 font-black text-sm text-slate-900">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Advance Salary</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Emergency monthly payroll advance against accrued service days.
          </p>
          <button
            onClick={() => setIsAdvanceModalOpen(true)}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-2xl shadow-md shadow-orange-500/20 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            Request Advance
          </button>
        </div>

        {/* Card 3: Birthdays & Anniversaries */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setBdayTab('birthdays')}
              className={`flex-1 py-1 rounded-lg transition ${
                bdayTab === 'birthdays' ? 'bg-white text-orange-600 shadow-sm font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              Recent Birthdays
            </button>
            <button
              onClick={() => setBdayTab('anniversary')}
              className={`flex-1 py-1 rounded-lg transition ${
                bdayTab === 'anniversary' ? 'bg-white text-orange-600 shadow-sm font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              Work Anniversary
            </button>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-amber-50/60 border border-amber-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
              KK
            </div>
            <div className="flex-1">
              <div className="font-bold text-xs text-slate-800">Kumkum Khatun</div>
              <div className="text-[10px] text-slate-500">25 Aug (In 1d)</div>
            </div>
            <Cake className="w-4 h-4 text-orange-500" />
          </div>
        </div>

        {/* Card 4: Company Policy & SOP */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center gap-2 font-black text-sm text-slate-900">
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Company Policy & SOP</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Standard Operating Procedures for Industrial Gate 1, Patrol, and Turnstile monitoring.
          </p>
          <button
            onClick={() => showToast('Opening ShieldOps Security Protocol PDF...')}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition cursor-pointer"
          >
            View SOP Document
          </button>
        </div>
      </div>

      {/* LEAVE APPLICATION MODAL (Sequential Multi-Tier Flow) */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Apply for Leave</h3>
                  <p className="text-[11px] text-slate-400">Sequential Multi-Stage Approval Workflow</p>
                </div>
              </div>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Approval Hierarchy Legend */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-amber-400 text-[11px] uppercase tracking-wider">
                Approval Progression Path
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                <div className="p-2 rounded-xl bg-sky-950/60 border border-sky-800/80 text-sky-300 font-bold">
                  1. Field Supervisor Recommendation
                </div>
                <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/80 text-purple-300 font-bold">
                  2. Operations Manager Endorsement
                </div>
                <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 font-bold">
                  3. AGM / DGM Final Authorization
                </div>
              </div>
            </div>

            <form onSubmit={handleApplyLeaveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Leave Category / Type:</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold outline-none focus:border-orange-500"
                >
                  <option value="Casual Leave (CL)">Casual Leave (CL)</option>
                  <option value="Medical Leave (ML)">Medical Leave (ML)</option>
                  <option value="Annual Earned Leave (AL)">Annual Earned Leave (AL)</option>
                  <option value="Emergency Family Leave">Emergency Family Leave</option>
                  <option value="Compensatory Rest Off">Compensatory Rest Off</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Start Date:</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">End Date:</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Specific Reason & Site Handover Notes:</label>
                <textarea
                  rows={3}
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Describe your reason and any handover notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-lg transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADVANCE SALARY MODAL */}
      {isAdvanceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white">Request Advance Salary</h3>
              <button onClick={() => setIsAdvanceModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdvanceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Amount (৳ BDT):</label>
                <input
                  type="number"
                  required
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono font-bold outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Reason for Advance:</label>
                <textarea
                  rows={2}
                  required
                  value={advanceReason}
                  onChange={(e) => setAdvanceReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md transition"
              >
                Confirm Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
