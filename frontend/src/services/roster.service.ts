import { Roster, RosterStatus } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const RosterService = {
  async generateRoster(date: string): Promise<any> {
    const res = await fetch(`${API_BASE}/rosters/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    });
    if (!res.ok) throw new Error('Failed to generate roster');
    return res.json();
  },

  async getRosterByDate(date: string): Promise<{ roster: Roster; requirements: any[] }> {
    const res = await fetch(`${API_BASE}/rosters/${date}`);
    if (!res.ok) throw new Error('Failed to fetch roster for date');
    return res.json();
  },

  async reassignGuard(
    rosterId: string,
    payload: {
      guardId: string;
      targetLocationId: string;
      targetShiftId: string;
      targetPostId?: string;
      isOverride?: boolean;
      overrideReason?: string;
    }
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/rosters/${rosterId}/reassign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to reassign guard');
    return res.json();
  },

  async updateRosterStatus(rosterId: string, status: RosterStatus): Promise<any> {
    const res = await fetch(`${API_BASE}/rosters/${rosterId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update roster status');
    return res.json();
  },
};
