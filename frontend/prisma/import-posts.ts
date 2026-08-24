import { PrismaClient, PostType, GuardStatus, Shift, AssignmentStatus, LeaveStatus } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface CsvRow {
  postName: string;
  type: 'FIXED' | 'ROTATING';
  locationName: string;
  requiredDay: number;
  requiredNight: number;
  dayShiftGuards: string[];
  nightShiftGuards: string[];
}

function parseCsv(content: string): CsvRow[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle CSV quoting for guard names
    const parts: string[] = [];
    let insideQuotes = false;
    let currentPart = '';

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        parts.push(currentPart.trim());
        currentPart = '';
      } else {
        currentPart += char;
      }
    }
    parts.push(currentPart.trim());

    if (parts.length >= 7) {
      const postName = parts[0];
      const type = parts[1].toUpperCase() === 'FIXED' ? 'FIXED' : 'ROTATING';
      const locationName = parts[2];
      const requiredDay = parseInt(parts[3], 10) || 0;
      const requiredNight = parseInt(parts[4], 10) || 0;
      const dayShiftGuards = parts[5].split(',').map((s) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
      const nightShiftGuards = parts[6].split(',').map((s) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);

      rows.push({
        postName,
        type,
        locationName,
        requiredDay,
        requiredNight,
        dayShiftGuards,
        nightShiftGuards,
      });
    }
  }

  return rows;
}

async function main() {
  console.log('🚀 Starting Post-Wise Guard Roster Bulk Import on Neon Postgres...');

  const csvPath = path.join(__dirname, 'seed-posts.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const parsedRows = parseCsv(csvContent);

  console.log(`📄 Parsed ${parsedRows.length} Posts from CSV.`);

  // 1. Clean existing data
  await prisma.assignment.deleteMany({});
  await prisma.leave.deleteMany({});
  await prisma.guard.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.location.deleteMany({});
  console.log('🧹 Cleaned existing tables.');

  // 2. Ensure Locations exist
  const locationMap = new Map<string, string>(); // name -> id
  for (const row of parsedRows) {
    if (!locationMap.has(row.locationName)) {
      const loc = await prisma.location.create({
        data: {
          name: row.locationName,
          address: 'Gazipur Industrial Zone, Block C',
          supervisorId: 'SUPERVISOR-DELWAR',
        },
      });
      locationMap.set(row.locationName, loc.id);
      console.log(`📍 Created Location: ${row.locationName}`);
    }
  }

  // 3. Create Posts
  const postMap = new Map<string, any>(); // postName -> postObject
  for (const row of parsedRows) {
    const locId = locationMap.get(row.locationName)!;
    const post = await prisma.post.create({
      data: {
        locationId: locId,
        name: row.postName,
        requiredDay: row.requiredDay,
        requiredNight: row.requiredNight,
        type: row.type === 'FIXED' ? PostType.FIXED : PostType.ROTATING,
      },
    });
    postMap.set(row.postName, post);
    console.log(`🛡️ Created Post: ${row.postName} (${row.type} — Day: ${row.requiredDay}, Night: ${row.requiredNight})`);
  }

  // 4. Duplicate Guard Tracking & Creation
  // Rule:
  // - 1st occurrence: Guard created with fixedPostId = this post, fixedShift = DAY or NIGHT (if post is FIXED), status = ACTIVE.
  // - 2nd+ occurrence: Guard created with suffix (e.g. "Name (2)" / unique identifier), fixedPostId = null (rotating backup), assigned for today.
  const guardNameTracker = new Map<string, { count: number; primaryGuardId: string }>();
  let totalGuardsCreated = 0;
  const targetDate = new Date('2026-08-24T00:00:00.000Z');
  const assignmentsToCreate: any[] = [];

  for (const row of parsedRows) {
    const post = postMap.get(row.postName);

    // Process Day Shift Guards
    for (const rawName of row.dayShiftGuards) {
      const cleanName = rawName.trim();
      if (!cleanName) continue;

      let guardId: string;
      const tracker = guardNameTracker.get(cleanName);

      if (!tracker) {
        // 1st occurrence -> Fixed to this post if post is FIXED
        const created = await prisma.guard.create({
          data: {
            name: cleanName,
            phone: `+880 17${String(10000000 + (totalGuardsCreated + 1) * 837).substring(0, 8)}`,
            nid: `199${(800000000 + (totalGuardsCreated + 1) * 917).toString()}`,
            address: 'Gazipur Industrial Area',
            joinDate: new Date('2023-03-15'),
            status: GuardStatus.ACTIVE,
            fixedPostId: row.type === 'FIXED' ? post.id : null,
            fixedShift: row.type === 'FIXED' ? Shift.DAY : null,
          },
        });
        guardId = created.id;
        guardNameTracker.set(cleanName, { count: 1, primaryGuardId: guardId });
        totalGuardsCreated++;
      } else {
        // Duplicate occurrence -> Create unique floating/rotating guard with suffix
        tracker.count += 1;
        const duplicateDisplayName = `${cleanName} (${tracker.count})`;
        const created = await prisma.guard.create({
          data: {
            name: duplicateDisplayName,
            phone: `+880 17${String(10000000 + (totalGuardsCreated + 1) * 837).substring(0, 8)}`,
            nid: `199${(800000000 + (totalGuardsCreated + 1) * 917).toString()}`,
            address: 'Gazipur Industrial Area',
            joinDate: new Date('2023-03-15'),
            status: GuardStatus.ACTIVE,
            fixedPostId: null, // Rotating backup
            fixedShift: null,
          },
        });
        guardId = created.id;
        totalGuardsCreated++;
        console.log(`🔁 Duplicate detected for "${cleanName}". Created backup guard: "${duplicateDisplayName}"`);
      }

      assignmentsToCreate.push({
        guardId,
        postId: post.id,
        date: targetDate,
        shift: Shift.DAY,
        status: AssignmentStatus.CONFIRMED,
      });
    }

    // Process Night Shift Guards
    for (const rawName of row.nightShiftGuards) {
      const cleanName = rawName.trim();
      if (!cleanName) continue;

      let guardId: string;
      const tracker = guardNameTracker.get(cleanName);

      if (!tracker) {
        // 1st occurrence
        const created = await prisma.guard.create({
          data: {
            name: cleanName,
            phone: `+880 17${String(10000000 + (totalGuardsCreated + 1) * 837).substring(0, 8)}`,
            nid: `199${(800000000 + (totalGuardsCreated + 1) * 917).toString()}`,
            address: 'Gazipur Industrial Area',
            joinDate: new Date('2023-03-15'),
            status: GuardStatus.ACTIVE,
            fixedPostId: row.type === 'FIXED' ? post.id : null,
            fixedShift: row.type === 'FIXED' ? Shift.NIGHT : null,
          },
        });
        guardId = created.id;
        guardNameTracker.set(cleanName, { count: 1, primaryGuardId: guardId });
        totalGuardsCreated++;
      } else {
        // Duplicate occurrence
        tracker.count += 1;
        const duplicateDisplayName = `${cleanName} (${tracker.count})`;
        const created = await prisma.guard.create({
          data: {
            name: duplicateDisplayName,
            phone: `+880 17${String(10000000 + (totalGuardsCreated + 1) * 837).substring(0, 8)}`,
            nid: `199${(800000000 + (totalGuardsCreated + 1) * 917).toString()}`,
            address: 'Gazipur Industrial Area',
            joinDate: new Date('2023-03-15'),
            status: GuardStatus.ACTIVE,
            fixedPostId: null, // Rotating backup
            fixedShift: null,
          },
        });
        guardId = created.id;
        totalGuardsCreated++;
        console.log(`🔁 Duplicate detected for "${cleanName}". Created backup guard: "${duplicateDisplayName}"`);
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

  // 5. Insert All Confirmed Assignments in Batch
  await prisma.assignment.createMany({ data: assignmentsToCreate });
  console.log(`✅ Created ${assignmentsToCreate.length} Assignments in Neon Database for date 2026-08-24.`);

  // 6. Add Additional Reserve / Floating Guards to maintain 200 total force
  const remainingCount = Math.max(0, 200 - totalGuardsCreated);
  if (remainingCount > 0) {
    const reserveGuardsData = [];
    for (let i = 0; i < remainingCount; i++) {
      const idx = totalGuardsCreated + i + 1;
      reserveGuardsData.push({
        name: `Md. Reserve Guard ${idx}`,
        phone: `+880 17${String(10000000 + idx * 837).substring(0, 8)}`,
        nid: `199${(800000000 + idx * 917).toString()}`,
        address: 'Dhaka Metropolitan Reserve Pool',
        joinDate: new Date('2023-03-15'),
        status: i < 5 ? GuardStatus.ON_LEAVE : GuardStatus.ACTIVE,
        fixedPostId: null, // Rotating reserve
        fixedShift: null,
      });
    }
    await prisma.guard.createMany({ data: reserveGuardsData });
    console.log(`✅ Created ${remainingCount} Standby/Reserve Pool Guards (Total Workforce = 200).`);
  }

  // 7. Seed Sample Leaves
  const sampleGuard = await prisma.guard.findFirst({ where: { status: GuardStatus.ON_LEAVE } });
  if (sampleGuard) {
    await prisma.leave.create({
      data: {
        guardId: sampleGuard.id,
        startDate: new Date('2026-08-25'),
        endDate: new Date('2026-08-28'),
        type: 'Approved Medical Sick Leave',
        status: LeaveStatus.APPROVED,
      },
    });
  }

  console.log('🎉 Bulk Import from CSV Completed Successfully on Neon Database!');
}

main()
  .catch((e) => {
    console.error('❌ Import error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
