import { PrismaClient, PostType, GuardStatus, Shift, AssignmentStatus, LeaveStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Operational Math:
// Total Guards = 200
// 6-Day Duty / 1-Day Off Rotation:
// ~28 guards have their scheduled weekly Off-Day today.
// ~4 guards on approved Leave.
// Working Guards Today = 200 - 28 - 4 = 168 Guards (84 Day Shift + 84 Night Shift).
// Total Posts will have exactly 84 Day Slots + 84 Night Slots = 168 Total Duty Slots!
// Result: 100% of available guards are ON DUTY. Zero idle standby!

const postTemplates: { name: string; locationName: string; type: PostType; reqDay: number; reqNight: number }[] = [
  // --- MAIN FACTORY COMPLEX (Total Day: 50, Night: 50) ---
  { name: 'Main Gate & Turnstiles', locationName: 'Main Factory Complex', type: PostType.FIXED, reqDay: 4, reqNight: 4 },
  { name: '2nd Material Cargo Gate', locationName: 'Main Factory Complex', type: PostType.FIXED, reqDay: 3, reqNight: 3 },
  { name: '3rd Emergency Exit Gate', locationName: 'Main Factory Complex', type: PostType.FIXED, reqDay: 2, reqNight: 2 },
  { name: 'Central SOC & CCTV Command', locationName: 'Main Factory Complex', type: PostType.FIXED, reqDay: 2, reqNight: 2 },
  { name: 'Staff Foot Gate & Biometric Ingate', locationName: 'Main Factory Complex', type: PostType.FIXED, reqDay: 2, reqNight: 2 },
  { name: 'Admin Block & Executive Lobby', locationName: 'Main Factory Complex', type: PostType.FIXED, reqDay: 1, reqNight: 1 },
  { name: 'VIP Guest Parking Security', locationName: 'Main Factory Complex', type: PostType.FIXED, reqDay: 1, reqNight: 1 },
  { name: 'Power Substation & Generator Unit', locationName: 'Main Factory Complex', type: PostType.FIXED, reqDay: 1, reqNight: 1 },
  { name: 'Boiler & Utility Post', locationName: 'Main Factory Complex', type: PostType.FIXED, reqDay: 1, reqNight: 1 },
  { name: 'Raw Material Store Vault', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Chemical Store Gate 2', locationName: 'Main Factory Complex', type: PostType.FIXED, reqDay: 1, reqNight: 1 },
  { name: 'Finished Goods Warehouse Gate', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 2, reqNight: 2 },
  { name: 'Effluent Treatment Plant (ETP)', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Water Treatment Plant (WTP)', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Fabric Store Section A', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Fabric Store Section B', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Yarn Storage Vault', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Dyeing Unit Entry Gate', locationName: 'Main Factory Complex', type: PostType.FIXED, reqDay: 1, reqNight: 1 },
  { name: 'Finishing Unit Corridor Patrol', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Cutting Section Checkpoint', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Sewing Floor 1 Patrol', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Sewing Floor 2 Patrol', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Sewing Floor 3 Patrol', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Production Floor Patrol North', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Production Floor Patrol South', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Scrap & Waste Disposal Yard', locationName: 'Main Factory Complex', type: PostType.FIXED, reqDay: 1, reqNight: 1 },
  { name: 'Compressor & Chiller Plant', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Garage & Heavy Vehicle Bay', locationName: 'Main Factory Complex', type: PostType.FIXED, reqDay: 1, reqNight: 1 },
  { name: 'Worker Canteen & Locker Area', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Tower 1 - East Boundary Watch', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Tower 2 - North Boundary Watch', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Tower 3 - South Boundary Watch', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Tower 4 - West Boundary Watch', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Tower 5 - Northwest Watch', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Tower 6 - Southwest Watch', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Tower 7 - Central Watch', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Tower 8 - Riverfront Watch', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Boundary Wall Patrol Alpha', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Boundary Wall Patrol Bravo', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Boundary Wall Patrol Charlie', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Boundary Wall Patrol Delta', locationName: 'Main Factory Complex', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Fire Station & Pump House', locationName: 'Main Factory Complex', type: PostType.FIXED, reqDay: 1, reqNight: 1 },
  { name: 'Medical Center & Ambulance Gate', locationName: 'Main Factory Complex', type: PostType.FIXED, reqDay: 1, reqNight: 1 },
  { name: 'Substation Transformer Yard 2', locationName: 'Main Factory Complex', type: PostType.FIXED, reqDay: 1, reqNight: 1 },
  { name: 'Gas Meter & Regulating Station', locationName: 'Main Factory Complex', type: PostType.FIXED, reqDay: 1, reqNight: 1 },

  // --- CENTRAL LOGISTICS WAREHOUSE (Day: 12, Night: 12) ---
  { name: 'Warehouse Main Entry Ingate', locationName: 'Central Logistics Warehouse', type: PostType.FIXED, reqDay: 2, reqNight: 2 },
  { name: 'Dispatch & Weighbridge Scale', locationName: 'Central Logistics Warehouse', type: PostType.FIXED, reqDay: 2, reqNight: 2 },
  { name: 'Loading Dock 1 & 2', locationName: 'Central Logistics Warehouse', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Warehouse Cargo Bay 3', locationName: 'Central Logistics Warehouse', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Warehouse Cargo Bay 4', locationName: 'Central Logistics Warehouse', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Forklift Parking & Battery Bay', locationName: 'Central Logistics Warehouse', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Return Goods Inspection Room', locationName: 'Central Logistics Warehouse', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'East Boundary Perimeter Patrol', locationName: 'Central Logistics Warehouse', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'West Boundary Perimeter Patrol', locationName: 'Central Logistics Warehouse', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Warehouse CCTV Room', locationName: 'Central Logistics Warehouse', type: PostType.FIXED, reqDay: 1, reqNight: 1 },

  // --- NORTHERN EPZ UNIT (Day: 11, Night: 11) ---
  { name: 'EPZ Gate 1 Customs Checkpoint', locationName: 'Northern EPZ Unit', type: PostType.FIXED, reqDay: 2, reqNight: 2 },
  { name: 'EPZ Gate 2 Staff Entry', locationName: 'Northern EPZ Unit', type: PostType.FIXED, reqDay: 1, reqNight: 1 },
  { name: 'Bonded Warehouse Entrance', locationName: 'Northern EPZ Unit', type: PostType.FIXED, reqDay: 1, reqNight: 1 },
  { name: 'Carton & Packing Unit Post', locationName: 'Northern EPZ Unit', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Quality Inspection Safe Room', locationName: 'Northern EPZ Unit', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Export Container Loading Bay', locationName: 'Northern EPZ Unit', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'EPZ South Boundary Fence Watch', locationName: 'Northern EPZ Unit', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'EPZ North Boundary Fence Watch', locationName: 'Northern EPZ Unit', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'EPZ Emergency Exit West', locationName: 'Northern EPZ Unit', type: PostType.FIXED, reqDay: 1, reqNight: 1 },
  { name: 'EPZ Electrical Substation', locationName: 'Northern EPZ Unit', type: PostType.FIXED, reqDay: 1, reqNight: 1 },

  // --- RIVERPORT LOGISTICS TERMINAL (Day: 6, Night: 6) ---
  { name: 'Riverport Main Ingate', locationName: 'Riverport Logistics Terminal', type: PostType.FIXED, reqDay: 2, reqNight: 2 },
  { name: 'River Barge Berth 1 Checkpoint', locationName: 'Riverport Logistics Terminal', type: PostType.FIXED, reqDay: 1, reqNight: 1 },
  { name: 'River Barge Berth 2 Checkpoint', locationName: 'Riverport Logistics Terminal', type: PostType.FIXED, reqDay: 1, reqNight: 1 },
  { name: 'Cargo Crane Operations Deck', locationName: 'Riverport Logistics Terminal', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Riverport Perimeter Watch 1', locationName: 'Riverport Logistics Terminal', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },

  // --- CHEMICAL DEPOT & FLEET & CORPORATE (Day: 5, Night: 5) ---
  { name: 'Hazmat Depot Main Gate', locationName: 'Chemical & Hazardous Depot', type: PostType.FIXED, reqDay: 2, reqNight: 2 },
  { name: 'Solvent Storage Tank 1', locationName: 'Chemical & Hazardous Depot', type: PostType.FIXED, reqDay: 1, reqNight: 1 },
  { name: 'Tanker Unloading Bay', locationName: 'Chemical & Hazardous Depot', type: PostType.ROTATING, reqDay: 1, reqNight: 1 },
  { name: 'Fleet Yard Security Checkpoint', locationName: 'Fleet Maintenance Yard', type: PostType.FIXED, reqDay: 1, reqNight: 1 },
];

const bangladeshiNames = [
  'Golam Anisur Islam', 'Ali Monir Sarker', 'Abu Saiful Islam', 'Enamul Rashed Sarker',
  'Md. Rafiqul Islam', 'Mohammad Shofiqul Sarker', 'Abdul Mominul Islam', 'Kazi Kawsar Sarker',
  'Sheikh Shahidul Islam', 'Syed Jubayer Sarker', 'Golam Alamin Islam', 'Ali Kamal Sarker',
  'Abu Nazrul Islam', 'Enamul Tariqul Sarker', 'Md. Farhad Islam', 'Mohammad Zakir Sarker',
  'Abdul Mahfuz Islam', 'Kazi Habib Sarker', 'Sheikh Delwar Islam', 'Syed Jahangir Sarker',
  'Md. Tanvir Hossain', 'Habibur Rahman', 'Mizanur Rahman', 'Shahidul Alam',
  'Jahangir Alam', 'Kamrul Hasan', 'Ashraful Islam', 'Nurul Huda',
  'Mostofa Kamal', 'Mahbubur Rahman', 'Arifur Rahman', 'Ziaur Rahman',
  'Shakhawat Hossain', 'Farid Ahmed', 'Anwar Hossain', 'Belal Hossain',
  'Delwar Hossain', 'Sirajul Islam', 'Monirul Islam', 'Nazmul Huda',
  'Rashedul Islam', 'Saiful Islam', 'Tariqul Islam', 'Zakir Hossain',
  'Abdur Rashid', 'Abul Kashem', 'Azizul Haque', 'Badrul Alam',
  'Ehsanul Haque', 'Ferdous Ahmed', 'Golam Rabbani', 'Harunur Rashid',
  'Ismail Hossain', 'Jashim Uddin', 'Khaled Mahmud', 'Liton Mia',
  'Mahfuzur Rahman', 'Nasir Uddin', 'Obaidul Haque', 'Parvez Alam',
  'Qamrul Islam', 'Rezaul Karim', 'Sohag Mia', 'Touhidul Islam',
  'Uzzal Hossain', 'Wahidul Islam', 'Yunus Ali', 'Zubair Ahmed'
];

async function deployFullWorkforce() {
  console.log('🚀 Setting up 100% Workforce Deployment (NO STANDBY - Only Offday/Leave excluded)...');

  // 1. Clean existing tables
  await prisma.assignment.deleteMany({});
  await prisma.leave.deleteMany({});
  await prisma.guard.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.location.deleteMany({});

  // 2. Create Locations
  const uniqueLocs = Array.from(new Set(postTemplates.map((p) => p.locationName)));
  const locMap = new Map<string, string>();

  for (const locName of uniqueLocs) {
    const created = await prisma.location.create({
      data: {
        name: locName,
        address: 'Industrial Zone',
        supervisorId: 'SUPERVISOR-DELWAR',
      },
    });
    locMap.set(locName, created.id);
  }

  // 3. Create Posts
  let totalDayDemand = 0;
  let totalNightDemand = 0;
  const createdPosts = [];

  for (const p of postTemplates) {
    const locId = locMap.get(p.locationName)!;
    const post = await prisma.post.create({
      data: {
        locationId: locId,
        name: p.name,
        type: p.type,
        requiredDay: p.reqDay,
        requiredNight: p.reqNight,
      },
    });
    createdPosts.push(post);
    totalDayDemand += p.reqDay;
    totalNightDemand += p.reqNight;
  }

  const totalDemandSlots = totalDayDemand + totalNightDemand;
  console.log(`✅ Created ${createdPosts.length} Posts (Day Demand: ${totalDayDemand}, Night Demand: ${totalNightDemand}, Total Slots: ${totalDemandSlots}).`);

  // 4. Create 200 Named Guards
  // - 4 Guards on approved Leave
  // - ~28 Guards on scheduled 6/1 Off-Day
  // - Exactly 168 Guards ACTIVE ON DUTY today!
  const totalGuards = 200;
  const guardsData = [];

  for (let i = 0; i < totalGuards; i++) {
    const baseName = bangladeshiNames[i % bangladeshiNames.length];
    const repeatCount = Math.floor(i / bangladeshiNames.length);
    const fullName = repeatCount === 0 ? baseName : `${baseName} (${repeatCount + 1})`;

    // First 4 guards are on leave
    const isLeave = i < 4;

    guardsData.push({
      name: fullName,
      phone: `+880 17${String(10000000 + (i + 1) * 837).substring(0, 8)}`,
      nid: `199${(800000000 + (i + 1) * 917).toString()}`,
      address: 'Gazipur Industrial Sector',
      joinDate: new Date('2023-01-15'),
      status: isLeave ? GuardStatus.ON_LEAVE : GuardStatus.ACTIVE,
      fixedPostId: null,
      fixedShift: null,
    });
  }

  await prisma.guard.createMany({ data: guardsData });
  const allDbGuards = await prisma.guard.findMany({ orderBy: { id: 'asc' } });
  console.log(`✅ Seeded 200 Guards.`);

  // 5. Seed Leave records for the 4 on-leave guards
  for (let i = 0; i < 4; i++) {
    await prisma.leave.create({
      data: {
        guardId: allDbGuards[i].id,
        startDate: new Date('2026-08-24'),
        endDate: new Date('2026-08-27'),
        type: 'Medical / Personal Leave',
        status: LeaveStatus.APPROVED,
      },
    });
  }

  // 6. Assign working guards (Guards 4 to 171 = 168 guards) to all post slots!
  // Remaining guards (172 to 199 = 28 guards) have scheduled weekly OFF-DAY today!
  const targetDate = new Date('2026-08-24T00:00:00.000Z');
  const workingGuards = allDbGuards.slice(4, 4 + totalDemandSlots);
  const assignmentsToCreate = [];
  let gPointer = 0;

  for (const post of createdPosts) {
    // Day Shift Slots
    for (let d = 0; d < post.requiredDay; d++) {
      if (gPointer < workingGuards.length) {
        assignmentsToCreate.push({
          guardId: workingGuards[gPointer].id,
          postId: post.id,
          date: targetDate,
          shift: Shift.DAY,
          status: AssignmentStatus.CONFIRMED,
        });
        gPointer++;
      }
    }

    // Night Shift Slots
    for (let n = 0; n < post.requiredNight; n++) {
      if (gPointer < workingGuards.length) {
        assignmentsToCreate.push({
          guardId: workingGuards[gPointer].id,
          postId: post.id,
          date: targetDate,
          shift: Shift.NIGHT,
          status: AssignmentStatus.CONFIRMED,
        });
        gPointer++;
      }
    }
  }

  await prisma.assignment.createMany({ data: assignmentsToCreate });
  console.log(`✅ Created ${assignmentsToCreate.length} active assignments for 2026-08-24.`);

  const offDayCount = totalGuards - 4 - assignmentsToCreate.length;
  console.log(`🎉 Summary:`);
  console.log(`   • Total Guards: ${totalGuards}`);
  console.log(`   • Assigned on Duty: ${assignmentsToCreate.length} (100% of available posts filled)`);
  console.log(`   • Scheduled Off-Day (6/1 cycle): ${offDayCount} Guards`);
  console.log(`   • Approved Leave: 4 Guards`);
  console.log(`   • Unassigned / Standby: 0 Guards (ZERO standby)`);
}

deployFullWorkforce()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
