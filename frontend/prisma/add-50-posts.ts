import { PrismaClient, PostType, GuardStatus, Shift, AssignmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

// List of 50 new realistic Bangladeshi industrial security posts
const new50Posts = [
  // Expansion within Main Factory
  { name: 'Tower 5 - Northwest Watch', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Tower 6 - Southwest Watch', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Tower 7 - Central Watch', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Tower 8 - Riverfront Watch', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Staff Foot Gate & Bag Check', locationName: 'Main Factory Complex', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },
  { name: 'VIP Guest Parking Security', locationName: 'Main Factory Complex', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },
  { name: 'Chemical Store Gate 2', locationName: 'Main Factory Complex', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },
  { name: 'Effluent Treatment Plant (ETP)', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Water Treatment Plant (WTP)', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Fabric Store Section A', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Fabric Store Section B', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Yarn Storage Vault', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Dyeing Unit Entry Gate', locationName: 'Main Factory Complex', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },
  { name: 'Finishing Unit Corridor Patrol', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Cutting Section Checkpoint', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Sewing Floor 1 Patrol', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Sewing Floor 2 Patrol', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Sewing Floor 3 Patrol', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Scrap & Waste Disposal Yard', locationName: 'Main Factory Complex', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },
  { name: 'Compressor & Chiller Plant', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },

  // Central Logistics Warehouse Expansion
  { name: 'Warehouse Cargo Bay 3', locationName: 'Central Logistics Warehouse', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Warehouse Cargo Bay 4', locationName: 'Central Logistics Warehouse', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Forklift Parking & Battery Bay', locationName: 'Central Logistics Warehouse', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Dispatch & Weighbridge Scale', locationName: 'Central Logistics Warehouse', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },
  { name: 'Return Goods Inspection Room', locationName: 'Central Logistics Warehouse', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'East Boundary Perimeter Patrol', locationName: 'Central Logistics Warehouse', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'West Boundary Perimeter Patrol', locationName: 'Central Logistics Warehouse', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },

  // Chemical & Hazardous Depot Expansion
  { name: 'Solvent Storage Tank 1', locationName: 'Chemical & Hazardous Depot', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },
  { name: 'Acid Storage Bunker', locationName: 'Chemical & Hazardous Depot', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },
  { name: 'Fire Hydrant Control Station', locationName: 'Chemical & Hazardous Depot', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Depot Rear Emergency Gate', locationName: 'Chemical & Hazardous Depot', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },

  // Riverport Terminal (New Hub)
  { name: 'River Barge Berth 1 Checkpoint', locationName: 'Riverport Logistics Terminal', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },
  { name: 'River Barge Berth 2 Checkpoint', locationName: 'Riverport Logistics Terminal', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },
  { name: 'Cargo Crane Operations Deck', locationName: 'Riverport Logistics Terminal', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Container Staging Yard Alpha', locationName: 'Riverport Logistics Terminal', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Container Staging Yard Beta', locationName: 'Riverport Logistics Terminal', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Riverport Main Ingate', locationName: 'Riverport Logistics Terminal', type: PostType.FIXED, requiredDay: 2, requiredNight: 2 },
  { name: 'Riverport Perimeter Watch 1', locationName: 'Riverport Logistics Terminal', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },

  // Northern Export Processing Zone (EPZ Sub-Unit)
  { name: 'EPZ Gate 1 Customs Checkpoint', locationName: 'Northern EPZ Unit', type: PostType.FIXED, requiredDay: 2, requiredNight: 2 },
  { name: 'EPZ Gate 2 Staff Entry', locationName: 'Northern EPZ Unit', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },
  { name: 'Bonded Warehouse Entrance', locationName: 'Northern EPZ Unit', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },
  { name: 'Carton & Packing Unit Post', locationName: 'Northern EPZ Unit', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Quality Inspection Safe Room', locationName: 'Northern EPZ Unit', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Export Container Loading Bay', locationName: 'Northern EPZ Unit', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'EPZ South Boundary Fence Watch', locationName: 'Northern EPZ Unit', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'EPZ North Boundary Fence Watch', locationName: 'Northern EPZ Unit', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },

  // Fleet Yard & Corporate Sites
  { name: 'Heavy Truck Fueling Station', locationName: 'Fleet Maintenance Yard', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },
  { name: 'Spare Parts Secure Store', locationName: 'Fleet Maintenance Yard', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Driver Rest Area & Ingate', locationName: 'Fleet Maintenance Yard', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },
  { name: 'Server & IT Data Center Lobby', locationName: 'Corporate Annex Site', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },
];

async function add50Posts() {
  console.log('🚀 Adding 50 New Realistic Security Posts to Neon Database...');

  // 1. Ensure all Locations exist
  const uniqueLocs = Array.from(new Set(new50Posts.map((p) => p.locationName)));
  const locMap = new Map<string, string>();

  const existingLocs = await prisma.location.findMany();
  existingLocs.forEach((l) => locMap.set(l.name, l.id));

  for (const locName of uniqueLocs) {
    if (!locMap.has(locName)) {
      const created = await prisma.location.create({
        data: {
          name: locName,
          address: 'Industrial Development Zone',
          supervisorId: 'SUPERVISOR-FIELD',
        },
      });
      locMap.set(locName, created.id);
      console.log(`📍 Created Location: ${locName}`);
    }
  }

  // 2. Create the 50 Posts
  const createdPosts: any[] = [];
  for (const p of new50Posts) {
    const locId = locMap.get(p.locationName)!;
    const post = await prisma.post.create({
      data: {
        locationId: locId,
        name: p.name,
        type: p.type,
        requiredDay: p.requiredDay,
        requiredNight: p.requiredNight,
      },
    });
    createdPosts.push(post);
  }

  console.log(`✅ Successfully added ${createdPosts.length} new Posts!`);

  // 3. Assign available unassigned guards to the new posts
  const targetDate = new Date('2026-08-24T00:00:00.000Z');
  const allGuards = await prisma.guard.findMany({
    where: { status: GuardStatus.ACTIVE },
    orderBy: { id: 'asc' },
  });

  const existingAssignments = await prisma.assignment.findMany({
    where: { date: targetDate },
  });
  const assignedGuardIdSet = new Set(existingAssignments.map((a) => a.guardId));
  const availableGuards = allGuards.filter((g) => !assignedGuardIdSet.has(g.id));

  console.log(`ℹ️ Found ${availableGuards.length} Available Standby Guards to assign to new posts.`);

  const newAssignments = [];
  let gIdx = 0;

  for (const post of createdPosts) {
    // Day Shift
    for (let d = 0; d < post.requiredDay; d++) {
      if (gIdx < availableGuards.length) {
        newAssignments.push({
          guardId: availableGuards[gIdx].id,
          postId: post.id,
          date: targetDate,
          shift: Shift.DAY,
          status: AssignmentStatus.CONFIRMED,
        });
        gIdx++;
      }
    }

    // Night Shift
    for (let n = 0; n < post.requiredNight; n++) {
      if (gIdx < availableGuards.length) {
        newAssignments.push({
          guardId: availableGuards[gIdx].id,
          postId: post.id,
          date: targetDate,
          shift: Shift.NIGHT,
          status: AssignmentStatus.CONFIRMED,
        });
        gIdx++;
      }
    }
  }

  if (newAssignments.length > 0) {
    await prisma.assignment.createMany({ data: newAssignments });
    console.log(`✅ Created ${newAssignments.length} new duty assignments for the new posts.`);
  }

  // Count total posts and assignments
  const totalPostsCount = await prisma.post.count();
  const totalAsgCount = await prisma.assignment.count({ where: { date: targetDate } });
  console.log(`🎉 Database now has ${totalPostsCount} TOTAL POSTS and ${totalAsgCount} ASSIGNED GUARDS.`);
}

add50Posts()
  .catch((e) => {
    console.error('Error adding 50 posts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
