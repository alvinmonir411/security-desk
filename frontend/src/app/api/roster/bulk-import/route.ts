import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { PostType, GuardStatus, Shift, AssignmentStatus } from '@prisma/client';

interface ImportPostPayload {
  postName: string;
  type: 'FIXED' | 'ROTATING';
  locationName: string;
  requiredDay: number;
  requiredNight: number;
  dayShiftGuards: string[];
  nightShiftGuards: string[];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rows, targetDate: reqDate } = body as { rows: ImportPostPayload[]; targetDate?: string };

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: false, error: 'No data rows provided' }, { status: 400 });
    }

    const targetDate = new Date(reqDate || '2026-08-24T00:00:00.000Z');

    // Cache existing locations
    const existingLocations = await prisma.location.findMany();
    const locationMap = new Map<string, string>();
    existingLocations.forEach((l) => locationMap.set(l.name, l.id));

    // Cache existing guards
    const existingGuards = await prisma.guard.findMany();
    const guardNameTracker = new Map<string, { count: number; primaryGuardId: string }>();
    existingGuards.forEach((g) => {
      const baseName = g.name.replace(/\s\(\d+\)$/, '');
      const existing = guardNameTracker.get(baseName);
      if (!existing) {
        guardNameTracker.set(baseName, { count: 1, primaryGuardId: g.id });
      } else {
        existing.count += 1;
      }
    });

    let importedPostsCount = 0;
    let importedGuardsCount = 0;
    let duplicatesDetected = 0;
    const assignmentsToCreate: any[] = [];

    for (const row of rows) {
      // 1. Find or create Location
      const locName = row.locationName || 'Main Factory';
      let locationId = locationMap.get(locName);
      if (!locationId) {
        const newLoc = await prisma.location.create({
          data: {
            name: locName,
            address: 'Industrial Zone',
            supervisorId: 'SUPERVISOR-FIELD',
          },
        });
        locationId = newLoc.id;
        locationMap.set(locName, locationId);
      }

      // 2. Create or find Post
      let post = await prisma.post.findFirst({
        where: { locationId, name: row.postName },
      });

      if (!post) {
        post = await prisma.post.create({
          data: {
            locationId,
            name: row.postName,
            requiredDay: Number(row.requiredDay) || 0,
            requiredNight: Number(row.requiredNight) || 0,
            type: row.type === 'FIXED' ? PostType.FIXED : PostType.ROTATING,
          },
        });
      } else {
        post = await prisma.post.update({
          where: { id: post.id },
          data: {
            requiredDay: Number(row.requiredDay) || 0,
            requiredNight: Number(row.requiredNight) || 0,
            type: row.type === 'FIXED' ? PostType.FIXED : PostType.ROTATING,
          },
        });
      }
      importedPostsCount++;

      // 3. Process Day Shift Guards
      for (const rawName of row.dayShiftGuards || []) {
        const cleanName = rawName.trim();
        if (!cleanName) continue;

        let guardId: string;
        const tracker = guardNameTracker.get(cleanName);

        if (!tracker) {
          const created = await prisma.guard.create({
            data: {
              name: cleanName,
              phone: `+880 17${String(10000000 + Math.floor(Math.random() * 8999999))}`,
              nid: `199${Math.floor(100000000 + Math.random() * 899999999)}`,
              address: 'Dhaka Division',
              joinDate: new Date(),
              status: GuardStatus.ACTIVE,
              fixedPostId: row.type === 'FIXED' ? post.id : null,
              fixedShift: row.type === 'FIXED' ? Shift.DAY : null,
            },
          });
          guardId = created.id;
          guardNameTracker.set(cleanName, { count: 1, primaryGuardId: guardId });
          importedGuardsCount++;
        } else {
          tracker.count += 1;
          duplicatesDetected++;
          const duplicateName = `${cleanName} (${tracker.count})`;
          const created = await prisma.guard.create({
            data: {
              name: duplicateName,
              phone: `+880 17${String(10000000 + Math.floor(Math.random() * 8999999))}`,
              nid: `199${Math.floor(100000000 + Math.random() * 899999999)}`,
              address: 'Dhaka Division',
              joinDate: new Date(),
              status: GuardStatus.ACTIVE,
              fixedPostId: null,
              fixedShift: null,
            },
          });
          guardId = created.id;
          importedGuardsCount++;
        }

        assignmentsToCreate.push({
          guardId,
          postId: post.id,
          date: targetDate,
          shift: Shift.DAY,
          status: AssignmentStatus.CONFIRMED,
        });
      }

      // 4. Process Night Shift Guards
      for (const rawName of row.nightShiftGuards || []) {
        const cleanName = rawName.trim();
        if (!cleanName) continue;

        let guardId: string;
        const tracker = guardNameTracker.get(cleanName);

        if (!tracker) {
          const created = await prisma.guard.create({
            data: {
              name: cleanName,
              phone: `+880 17${String(10000000 + Math.floor(Math.random() * 8999999))}`,
              nid: `199${Math.floor(100000000 + Math.random() * 899999999)}`,
              address: 'Dhaka Division',
              joinDate: new Date(),
              status: GuardStatus.ACTIVE,
              fixedPostId: row.type === 'FIXED' ? post.id : null,
              fixedShift: row.type === 'FIXED' ? Shift.NIGHT : null,
            },
          });
          guardId = created.id;
          guardNameTracker.set(cleanName, { count: 1, primaryGuardId: guardId });
          importedGuardsCount++;
        } else {
          tracker.count += 1;
          duplicatesDetected++;
          const duplicateName = `${cleanName} (${tracker.count})`;
          const created = await prisma.guard.create({
            data: {
              name: duplicateName,
              phone: `+880 17${String(10000000 + Math.floor(Math.random() * 8999999))}`,
              nid: `199${Math.floor(100000000 + Math.random() * 899999999)}`,
              address: 'Dhaka Division',
              joinDate: new Date(),
              status: GuardStatus.ACTIVE,
              fixedPostId: null,
              fixedShift: null,
            },
          });
          guardId = created.id;
          importedGuardsCount++;
        }

        assignmentsToCreate.push({
          guardId,
          postId: post.id,
          date: targetDate,
          shift: Shift.NIGHT,
          status: AssignmentStatus.CONFIRMED,
        });
      }
    }

    if (assignmentsToCreate.length > 0) {
      await prisma.assignment.createMany({
        data: assignmentsToCreate,
      });
    }

    return NextResponse.json({
      success: true,
      importedPostsCount,
      importedGuardsCount,
      duplicatesDetected,
      assignmentsCreated: assignmentsToCreate.length,
      message: `${importedPostsCount} posts and ${importedGuardsCount} guards imported (${duplicatesDetected} duplicate assignments resolved as rotating backups).`,
    });
  } catch (error: any) {
    console.error('Error in bulk import:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
