import { PrismaClient, PostType, GuardStatus, Shift, AssignmentStatus, LeaveStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Fast Batch Database Seeding on Neon Postgres...');

  // Clean existing data
  await prisma.assignment.deleteMany({});
  await prisma.leave.deleteMany({});
  await prisma.guard.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.location.deleteMany({});

  console.log('🧹 Cleaned existing tables.');

  // 1. Create Locations & Posts
  const loc1 = await prisma.location.create({
    data: {
      name: 'Main Factory Complex',
      address: 'Gazipur Industrial Area, Block C',
      supervisorId: 'SUPERVISOR-DELWAR',
      posts: {
        create: [
          { name: 'Main Gate & Turnstile', requiredDay: 8, requiredNight: 8, type: PostType.FIXED },
          { name: '2nd Material Gate', requiredDay: 10, requiredNight: 10, type: PostType.FIXED },
          { name: '3rd Emergency Gate', requiredDay: 4, requiredNight: 4, type: PostType.FIXED },
          { name: 'Garage & Heavy Fleet Bay', requiredDay: 4, requiredNight: 4, type: PostType.FIXED },
          { name: 'Tower 2 North Perimeter', requiredDay: 8, requiredNight: 8, type: PostType.ROTATING },
          { name: 'Tower 3 South Perimeter', requiredDay: 8, requiredNight: 8, type: PostType.ROTATING },
          { name: 'Production Floor Patrol 1 & 2', requiredDay: 12, requiredNight: 12, type: PostType.ROTATING },
          { name: 'Raw Material Store Vault', requiredDay: 8, requiredNight: 8, type: PostType.ROTATING },
          { name: 'Power Substation & Boiler', requiredDay: 4, requiredNight: 4, type: PostType.FIXED },
          { name: 'Central SOC & CCTV Command', requiredDay: 4, requiredNight: 4, type: PostType.FIXED },
        ],
      },
    },
    include: { posts: true },
  });

  const loc2 = await prisma.location.create({
    data: {
      name: 'Central Warehouse',
      address: 'Tejgaon Light Industrial Area',
      supervisorId: 'SUPERVISOR-KARIM',
      posts: {
        create: [
          { name: 'Loading Bay & Dock Gate', requiredDay: 2, requiredNight: 2, type: PostType.FIXED },
          { name: 'High-Value Inventory Cage', requiredDay: 1, requiredNight: 1, type: PostType.ROTATING },
        ],
      },
    },
    include: { posts: true },
  });

  const loc3 = await prisma.location.create({
    data: {
      name: 'Corporate Annex',
      address: 'Gulshan-2 Commercial Circle',
      supervisorId: 'SUPERVISOR-HABIB',
      posts: {
        create: [
          { name: 'Main Turnstile Reception', requiredDay: 1, requiredNight: 1, type: PostType.FIXED },
          { name: 'VIP Lift Lobby & Basement', requiredDay: 1, requiredNight: 1, type: PostType.ROTATING },
        ],
      },
    },
    include: { posts: true },
  });

  const loc4 = await prisma.location.create({
    data: {
      name: 'Chemical Depot',
      address: 'Siddhirganj Riverport Outer Ring',
      supervisorId: 'SUPERVISOR-SULTAN',
      posts: {
        create: [
          { name: 'Hazmat Perimeter Gate', requiredDay: 2, requiredNight: 2, type: PostType.FIXED },
          { name: 'Weighbridge & Tanker Dock', requiredDay: 1, requiredNight: 1, type: PostType.ROTATING },
        ],
      },
    },
    include: { posts: true },
  });

  const loc5 = await prisma.location.create({
    data: {
      name: 'Fleet & Logistics Yard',
      address: 'Ashulia Highway Terminal',
      supervisorId: 'SUPERVISOR-NAZRUL',
      posts: {
        create: [
          { name: 'Fleet Entry Gate & Driver Check', requiredDay: 1, requiredNight: 1, type: PostType.FIXED },
          { name: 'Fuel Station & Yard Watch', requiredDay: 1, requiredNight: 1, type: PostType.ROTATING },
        ],
      },
    },
    include: { posts: true },
  });

  const allPosts = [...loc1.posts, ...loc2.posts, ...loc3.posts, ...loc4.posts, ...loc5.posts];
  console.log(`✅ Seeded 5 Locations with ${allPosts.length} Posts.`);

  // 2. Fast Batch Create 200 Security Guards
  const firstNames = ['Md.', 'Mohammad', 'Abdul', 'Kazi', 'Sheikh', 'Syed', 'Golam', 'Ali', 'Abu', 'Enamul'];
  const middleNames = ['Rafiqul', 'Kamal', 'Delwar', 'Shofiqul', 'Nazrul', 'Jahangir', 'Mominul', 'Tariqul', 'Anisur', 'Kawsar', 'Farhad', 'Monir', 'Shahidul', 'Zakir', 'Saiful', 'Jubayer', 'Mahfuz', 'Rashed', 'Alamin', 'Habib'];
  const lastNames = ['Islam', 'Hossain', 'Rahman', 'Khan', 'Miah', 'Ahmed', 'Chowdhury', 'Sarker', 'Bhuiyan', 'Haque', 'Sikder', 'Patwary', 'Dewan', 'Gazi'];

  const fixedPostMap = [
    { maxIndex: 16, post: loc1.posts[0] },
    { maxIndex: 36, post: loc1.posts[1] },
    { maxIndex: 44, post: loc1.posts[2] },
    { maxIndex: 52, post: loc1.posts[3] },
    { maxIndex: 60, post: loc1.posts[8] },
    { maxIndex: 68, post: loc1.posts[9] },
    { maxIndex: 72, post: loc2.posts[0] },
    { maxIndex: 74, post: loc3.posts[0] },
    { maxIndex: 78, post: loc4.posts[0] },
    { maxIndex: 80, post: loc5.posts[0] },
  ];

  const guardsData = [];
  for (let i = 0; i < 200; i++) {
    const fn = firstNames[i % firstNames.length];
    const mn = middleNames[(i * 3) % middleNames.length];
    const ln = lastNames[(i * 7) % lastNames.length];
    let status = GuardStatus.ACTIVE;
    if (i >= 190 && i < 195) status = GuardStatus.ON_LEAVE;
    else if (i >= 195 && i < 198) status = GuardStatus.ABSENT;

    let fixedPostId: string | null = null;
    for (const mapping of fixedPostMap) {
      if (i < mapping.maxIndex) {
        fixedPostId = mapping.post.id;
        break;
      }
    }

    guardsData.push({
      name: `${fn} ${mn} ${ln}`,
      phone: `+880 17${String(10000000 + i * 837).substring(0, 8)}`,
      nid: `199${(800000000 + i * 917).toString()}`,
      address: i < 140 ? 'Gazipur' : (i < 160 ? 'Tejgaon' : 'Gulshan'),
      joinDate: new Date('2023-03-15'),
      status,
      fixedPostId,
    });
  }

  await prisma.guard.createMany({ data: guardsData });
  const createdGuards = await prisma.guard.findMany({ orderBy: { createdAt: 'asc' } });
  console.log(`✅ Seeded ${createdGuards.length} Guards in batch.`);

  // 3. Batch Create Assignments for 2026-08-24 (158 Assigned, 2 Shortage at Chemical Depot Hazmat)
  const targetDate = new Date('2026-08-24T00:00:00.000Z');
  let guardIdx = 0;
  const assignmentsToCreate = [];

  for (const post of allPosts) {
    let dayCount = post.requiredDay;
    let nightCount = post.requiredNight;

    if (post.id === loc4.posts[0].id) {
      nightCount = 0; // leaves 2 shortage
    }

    for (let d = 0; d < dayCount; d++) {
      if (guardIdx < createdGuards.length) {
        assignmentsToCreate.push({
          guardId: createdGuards[guardIdx++].id,
          postId: post.id,
          date: targetDate,
          shift: Shift.DAY,
          status: AssignmentStatus.CONFIRMED,
        });
      }
    }

    for (let n = 0; n < nightCount; n++) {
      if (guardIdx < createdGuards.length) {
        assignmentsToCreate.push({
          guardId: createdGuards[guardIdx++].id,
          postId: post.id,
          date: targetDate,
          shift: Shift.NIGHT,
          status: AssignmentStatus.CONFIRMED,
        });
      }
    }
  }

  await prisma.assignment.createMany({ data: assignmentsToCreate });
  console.log(`✅ Seeded ${assignmentsToCreate.length} Assignments for date 2026-08-24.`);

  // 4. Seed Leave Requests
  await prisma.leave.createMany({
    data: [
      {
        guardId: createdGuards[190].id,
        startDate: new Date('2026-08-26'),
        endDate: new Date('2026-08-28'),
        type: 'Sick Leave - Fever & Doctor Checkup',
        status: LeaveStatus.PENDING,
      },
      {
        guardId: createdGuards[191].id,
        startDate: new Date('2026-08-25'),
        endDate: new Date('2026-08-26'),
        type: 'Family Emergency Leave',
        status: LeaveStatus.PENDING,
      },
      {
        guardId: createdGuards[192].id,
        startDate: new Date('2026-08-23'),
        endDate: new Date('2026-08-24'),
        type: 'Personal Leave',
        status: LeaveStatus.APPROVED,
      },
    ],
  });

  console.log('🎉 Full Neon Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
