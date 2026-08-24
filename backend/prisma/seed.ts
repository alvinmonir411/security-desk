import { PrismaClient, RoleType, GuardStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Enterprise Database Seeding...');

  // 1. Clean existing records in sequence
  await prisma.auditLog.deleteMany();
  await prisma.replacementRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.rosterAssignment.deleteMany();
  await prisma.roster.deleteMany();
  await prisma.locationRequirement.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.securityGuard.deleteMany();
  await prisma.locationPost.deleteMany();
  await prisma.location.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('ShieldOps@2026', 10);

  // 2. Create Executive Leadership & Management
  const dgmUser = await prisma.user.create({
    data: {
      email: 'dgm@shieldops.com',
      passwordHash,
      fullName: 'Brig. Gen. (Retd) Anwar Hossain',
      phone: '+8801711000001',
      role: RoleType.DGM,
    },
  });

  const agmUser = await prisma.user.create({
    data: {
      email: 'agm@shieldops.com',
      passwordHash,
      fullName: 'Col. (Retd) M. A. Rashid',
      phone: '+8801711000002',
      role: RoleType.AGM,
      managerId: dgmUser.id,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@shieldops.com',
      passwordHash,
      fullName: 'Major (Retd) Selim Jahangir',
      phone: '+8801711000003',
      role: RoleType.MANAGER,
      managerId: agmUser.id,
    },
  });

  const supervisorUser = await prisma.user.create({
    data: {
      email: 'supervisor@shieldops.com',
      passwordHash,
      fullName: 'Md. Delwar Hossain (Senior Supervisor)',
      phone: '+8801711000004',
      role: RoleType.SUPERVISOR,
      managerId: managerUser.id,
    },
  });

  // 3. Create Standard Shifts (12 Hours)
  const dayShift = await prisma.shift.create({
    data: {
      name: 'DAY',
      code: 'SHIFT_DAY_12H',
      startTime: '06:00',
      endTime: '18:00',
      durationHours: 12,
      crossesMidnight: false,
    },
  });

  const nightShift = await prisma.shift.create({
    data: {
      name: 'NIGHT',
      code: 'SHIFT_NIGHT_12H',
      startTime: '18:00',
      endTime: '06:00',
      durationHours: 12,
      crossesMidnight: true,
    },
  });

  // 4. Create Locations and Specialized Posts
  const factoryLoc = await prisma.location.create({
    data: {
      name: 'Main Manufacturing Complex (Factory)',
      code: 'LOC-FACTORY-MAIN',
      type: 'Factory',
      address: 'Gazipur Industrial Zone, Sector 4',
      posts: {
        create: [
          { name: 'Main Security Gate & Turnstile', code: 'POST-F01' },
          { name: 'Material & Heavy Vehicle Gate', code: 'POST-F02' },
          { name: 'Production Floor Patrol (Zone 1 & 2)', code: 'POST-F03' },
          { name: 'Finished Goods Warehouse Gate', code: 'POST-F04' },
          { name: 'Perimeter Wall & North Tower Watch', code: 'POST-F05' },
          { name: 'Power Substation & Boiler Room', code: 'POST-F06' },
          { name: 'Central SOC & CCTV Command', code: 'POST-F07' },
          { name: 'Executive Admin Entrance', code: 'POST-F08' },
        ],
      },
    },
  });

  const warehouseLoc = await prisma.location.create({
    data: {
      name: 'Sub-Site 1: Central Warehouse',
      code: 'LOC-SUB1-WAREHOUSE',
      type: 'Warehouse',
      address: 'Tejgaon Light Industrial Area',
      posts: {
        create: [
          { name: 'Loading Bay & Dock Gate', code: 'POST-S101' },
          { name: 'High-Value Goods Vault', code: 'POST-S102' },
        ],
      },
    },
  });

  const corpLoc = await prisma.location.create({
    data: {
      name: 'Sub-Site 2: Corporate Annex',
      code: 'LOC-SUB2-CORP',
      type: 'Corporate',
      address: 'Gulshan-2 Commercial Area',
      posts: {
        create: [
          { name: 'Main Reception & Access Gate', code: 'POST-S201' },
          { name: 'VIP Lift Lobby & Basement', code: 'POST-S202' },
        ],
      },
    },
  });

  const depotLoc = await prisma.location.create({
    data: {
      name: 'Sub-Site 3: Raw Chemical Depot',
      code: 'LOC-SUB3-DEPOT',
      type: 'Depot',
      address: 'Siddhirganj Riverport Outer Ring',
      posts: {
        create: [
          { name: 'Hazmat Perimeter Gate', code: 'POST-S301' },
          { name: 'Weighbridge Gate', code: 'POST-S302' },
        ],
      },
    },
  });

  const logisticsLoc = await prisma.location.create({
    data: {
      name: 'Sub-Site 4: Fleet & Logistics Yard',
      code: 'LOC-SUB4-LOGISTICS',
      type: 'Logistics',
      address: 'Ashulia Highway Terminal',
      posts: {
        create: [
          { name: 'Fleet Gate & Driver Entry', code: 'POST-S401' },
        ],
      },
    },
  });

  const residenceLoc = await prisma.location.create({
    data: {
      name: 'Sub-Site 5: Executive VIP Residence',
      code: 'LOC-SUB5-RESIDENCE',
      type: 'Residence',
      address: 'Baridhara Diplomatic Zone',
      posts: {
        create: [
          { name: 'Residence Main Gate', code: 'POST-S501' },
        ],
      },
    },
  });

  const allLocations = [factoryLoc, warehouseLoc, corpLoc, depotLoc, logisticsLoc, residenceLoc];

  // 5. Seed 200 Security Guards
  console.log('👤 Seeding 200 Security Guards...');
  const firstNames = ['Md.', 'Mohammad', 'Abdul', 'Kazi', 'Sheikh', 'Syed', 'Golam', 'Ali', 'Abu', 'Enamul'];
  const middleNames = ['Rafiqul', 'Kamal', 'Delwar', 'Shofiqul', 'Nazrul', 'Jahangir', 'Mominul', 'Tariqul', 'Anisur', 'Kawsar', 'Farhad', 'Monir', 'Shahidul', 'Zakir', 'Saiful', 'Jubayer', 'Mahfuz', 'Rashed', 'Alamin', 'Habib'];
  const lastNames = ['Islam', 'Hossain', 'Rahman', 'Khan', 'Miah', 'Ahmed', 'Chowdhury', 'Sarker', 'Bhuiyan', 'Haque', 'Sikder', 'Patwary', 'Dewan', 'Gazi'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  for (let i = 1; i <= 200; i++) {
    const idStr = String(i).padStart(3, '0');
    const fn = firstNames[i % firstNames.length];
    const mn = middleNames[i % middleNames.length];
    const ln = lastNames[i % lastNames.length];
    const fullName = `${fn} ${mn} ${ln}`;

    // Associate default location affinity (140 to factory, remaining 60 to sub-sites)
    let defLocId = factoryLoc.id;
    if (i > 140 && i <= 156) defLocId = warehouseLoc.id;
    else if (i > 156 && i <= 168) defLocId = corpLoc.id;
    else if (i > 168 && i <= 182) defLocId = depotLoc.id;
    else if (i > 182 && i <= 192) defLocId = logisticsLoc.id;
    else if (i > 192) defLocId = residenceLoc.id;

    const user = await prisma.user.create({
      data: {
        email: `guard${idStr}@shieldops.com`,
        passwordHash,
        fullName,
        phone: `+8801700${String(10000 + i)}`,
        role: RoleType.SECURITY_GUARD,
        supervisorId: supervisorUser.id,
        managerId: managerUser.id,
      },
    });

    await prisma.securityGuard.create({
      data: {
        userId: user.id,
        badgeNumber: `SEC-BD-${1000 + i}`,
        bloodGroup: bloodGroups[i % bloodGroups.length],
        joiningDate: new Date(2023, (i % 12), (i % 28) + 1),
        status: GuardStatus.ACTIVE,
        defaultLocationId: defLocId,
        accumulatedDutyHours: (120 + (i % 40) * 12),
      },
    });
  }

  // 6. Seed Dynamic Location Requirements for Next 7 Days
  console.log('📅 Seeding 7-Day Dynamic Location Requirements...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let d = 0; d < 7; d++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + d);

    // Factory: 70 Day + 70 Night = 140
    await prisma.locationRequirement.createMany({
      data: [
        { date: targetDate, locationId: factoryLoc.id, shiftId: dayShift.id, requiredGuards: 70 },
        { date: targetDate, locationId: factoryLoc.id, shiftId: nightShift.id, requiredGuards: 70 },
        // Sub-1: 8 Day + 8 Night = 16
        { date: targetDate, locationId: warehouseLoc.id, shiftId: dayShift.id, requiredGuards: 8 },
        { date: targetDate, locationId: warehouseLoc.id, shiftId: nightShift.id, requiredGuards: 8 },
        // Sub-2: 6 Day + 6 Night = 12
        { date: targetDate, locationId: corpLoc.id, shiftId: dayShift.id, requiredGuards: 6 },
        { date: targetDate, locationId: corpLoc.id, shiftId: nightShift.id, requiredGuards: 6 },
        // Sub-3: 7 Day + 7 Night = 14
        { date: targetDate, locationId: depotLoc.id, shiftId: dayShift.id, requiredGuards: 7 },
        { date: targetDate, locationId: depotLoc.id, shiftId: nightShift.id, requiredGuards: 7 },
        // Sub-4: 5 Day + 5 Night = 10
        { date: targetDate, locationId: logisticsLoc.id, shiftId: dayShift.id, requiredGuards: 5 },
        { date: targetDate, locationId: logisticsLoc.id, shiftId: nightShift.id, requiredGuards: 5 },
        // Sub-5: 4 Day + 4 Night = 8
        { date: targetDate, locationId: residenceLoc.id, shiftId: dayShift.id, requiredGuards: 4 },
        { date: targetDate, locationId: residenceLoc.id, shiftId: nightShift.id, requiredGuards: 4 },
      ],
    });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
