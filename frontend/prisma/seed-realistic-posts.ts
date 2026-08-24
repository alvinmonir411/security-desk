import { PrismaClient, PostType, GuardStatus, Shift, AssignmentStatus, LeaveStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface PostSpec {
  name: string;
  locationName: string;
  type: PostType;
  requiredDay: number;
  requiredNight: number;
}

// Realistic Factory & Multi-Location Security Post Structure:
// - Main/2nd/3rd Gates: 3-4 guards per shift
// - SOC CCTV & Loading: 2 guards per shift
// - All other single posts/towers/substations/patrols: EXACTLY 1 Guard per Shift (1 Day / 1 Night)
const realisticPosts: PostSpec[] = [
  // --- MAIN FACTORY ---
  { name: 'Main Gate & Turnstiles', locationName: 'Main Factory Complex', type: PostType.FIXED, requiredDay: 4, requiredNight: 4 },
  { name: '2nd Material Cargo Gate', locationName: 'Main Factory Complex', type: PostType.FIXED, requiredDay: 3, requiredNight: 3 },
  { name: '3rd Emergency Exit Gate', locationName: 'Main Factory Complex', type: PostType.FIXED, requiredDay: 2, requiredNight: 2 },
  { name: 'Central SOC & CCTV Command', locationName: 'Main Factory Complex', type: PostType.FIXED, requiredDay: 2, requiredNight: 2 },
  { name: 'Power Substation & Generator', locationName: 'Main Factory Complex', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },
  { name: 'Boiler & Utility Post', locationName: 'Main Factory Complex', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },
  { name: 'Raw Material Store Vault', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Finished Goods Warehouse Gate', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 2, requiredNight: 2 },
  { name: 'Tower 1 - East Boundary Watch', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Tower 2 - North Boundary Watch', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Tower 3 - South Boundary Watch', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Tower 4 - West Boundary Watch', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Production Floor Patrol North', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Production Floor Patrol South', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Admin Block & Executive Lobby', locationName: 'Main Factory Complex', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },
  { name: 'Worker Canteen & Locker Area', locationName: 'Main Factory Complex', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Garage & Heavy Vehicle Bay', locationName: 'Main Factory Complex', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },

  // --- CENTRAL WAREHOUSE ---
  { name: 'Warehouse Entry Gate', locationName: 'Central Logistics Warehouse', type: PostType.FIXED, requiredDay: 2, requiredNight: 2 },
  { name: 'Loading Dock 1 & 2', locationName: 'Central Logistics Warehouse', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },
  { name: 'Perimeter Watch Post', locationName: 'Central Logistics Warehouse', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },

  // --- CHEMICAL DEPOT ---
  { name: 'Hazmat Depot Gate', locationName: 'Chemical & Hazardous Depot', type: PostType.FIXED, requiredDay: 2, requiredNight: 2 },
  { name: 'Tanker Unloading Bay', locationName: 'Chemical & Hazardous Depot', type: PostType.ROTATING, requiredDay: 1, requiredNight: 1 },

  // --- CORPORATE ANNEX & FLEET YARD ---
  { name: 'Corporate Reception Lobby', locationName: 'Corporate Annex Site', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },
  { name: 'Fleet Yard Security Checkpoint', locationName: 'Fleet Maintenance Yard', type: PostType.FIXED, requiredDay: 1, requiredNight: 1 },
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

async function seedRealistic() {
  console.log('🚀 Seeding Realistic Post Distribution (1 Guard per post, 3-4 on Main Gates)...');

  // 1. Clean existing tables
  await prisma.assignment.deleteMany({});
  await prisma.leave.deleteMany({});
  await prisma.guard.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.location.deleteMany({});

  // 2. Create Locations
  const locationNames = Array.from(new Set(realisticPosts.map((p) => p.locationName)));
  const locMap = new Map<string, string>();

  for (const locName of locationNames) {
    const loc = await prisma.location.create({
      data: {
        name: locName,
        address: 'Gazipur Industrial Sector',
        supervisorId: 'SUPERVISOR-DELWAR',
      },
    });
    locMap.set(locName, loc.id);
  }

  // 3. Create Posts
  const createdPosts: any[] = [];
  let totalDayReq = 0;
  let totalNightReq = 0;

  for (const spec of realisticPosts) {
    const locId = locMap.get(spec.locationName)!;
    const post = await prisma.post.create({
      data: {
        locationId: locId,
        name: spec.name,
        type: spec.type,
        requiredDay: spec.requiredDay,
        requiredNight: spec.requiredNight,
      },
    });
    createdPosts.push(post);
    totalDayReq += spec.requiredDay;
    totalNightReq += spec.requiredNight;
  }

  console.log(`✅ Created ${createdPosts.length} Posts (Day Demand: ${totalDayReq}, Night Demand: ${totalNightReq}, Total Shift Slots: ${totalDayReq + totalNightReq}).`);

  // 4. Create 200 Guards (Fixed Guards bound to their posts + Rotating Guards)
  const totalGuards = 200;
  const guardRecords = [];

  let nameIndex = 0;
  for (let i = 0; i < totalGuards; i++) {
    const baseName = bangladeshiNames[nameIndex % bangladeshiNames.length];
    const repeatCount = Math.floor(nameIndex / bangladeshiNames.length);
    const fullName = repeatCount === 0 ? baseName : `${baseName} (${repeatCount + 1})`;
    nameIndex++;

    guardRecords.push({
      name: fullName,
      phone: `+880 17${String(10000000 + (i + 1) * 837).substring(0, 8)}`,
      nid: `199${(800000000 + (i + 1) * 917).toString()}`,
      address: 'Gazipur Industrial Area',
      joinDate: new Date('2023-01-10'),
      status: i < 8 ? GuardStatus.ON_LEAVE : GuardStatus.ACTIVE,
      fixedPostId: null,
      fixedShift: null,
    });
  }

  await prisma.guard.createMany({ data: guardRecords });
  const allDbGuards = await prisma.guard.findMany({ orderBy: { id: 'asc' } });
  console.log(`✅ Created ${allDbGuards.length} Guards in database.`);

  // 5. Assign guards to posts for target date 2026-08-24
  // - 1 guard per shift for single posts
  // - 3-4 guards for main gates
  const targetDate = new Date('2026-08-24T00:00:00.000Z');
  const assignmentsToCreate: any[] = [];
  let guardPointer = 0;

  for (const post of createdPosts) {
    // Fill Day shift
    for (let d = 0; d < post.requiredDay; d++) {
      if (guardPointer < allDbGuards.length) {
        // Skip on-leave guards
        while (guardPointer < allDbGuards.length && allDbGuards[guardPointer].status === GuardStatus.ON_LEAVE) {
          guardPointer++;
        }
        if (guardPointer < allDbGuards.length) {
          assignmentsToCreate.push({
            guardId: allDbGuards[guardPointer].id,
            postId: post.id,
            date: targetDate,
            shift: Shift.DAY,
            status: AssignmentStatus.CONFIRMED,
          });
          guardPointer++;
        }
      }
    }

    // Fill Night shift
    for (let n = 0; n < post.requiredNight; n++) {
      if (guardPointer < allDbGuards.length) {
        while (guardPointer < allDbGuards.length && allDbGuards[guardPointer].status === GuardStatus.ON_LEAVE) {
          guardPointer++;
        }
        if (guardPointer < allDbGuards.length) {
          assignmentsToCreate.push({
            guardId: allDbGuards[guardPointer].id,
            postId: post.id,
            date: targetDate,
            shift: Shift.NIGHT,
            status: AssignmentStatus.CONFIRMED,
          });
          guardPointer++;
        }
      }
    }
  }

  await prisma.assignment.createMany({ data: assignmentsToCreate });
  console.log(`✅ Created ${assignmentsToCreate.length} active assignments for 2026-08-24.`);
  console.log(`🎉 Standby Reserve Pool available: ${allDbGuards.length - assignmentsToCreate.length} Guards.`);
}

seedRealistic()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
