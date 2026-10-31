import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CampusShare database...\n");

  // Clean existing data
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.noteVote.deleteMany();
  await prisma.review.deleteMany();
  await prisma.report.deleteMany();
  await prisma.item.deleteMany();
  await prisma.note.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // ─── Users ──────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: "admin@university.edu",
      passwordHash,
      name: "Admin User",
      collegeName: "State University",
      department: "Administration",
      graduationYear: 2025,
      avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=AU",
      bio: "Campus marketplace administrator.",
      role: "ADMIN",
      isVerified: true,
    },
  });

  const alice = await prisma.user.create({
    data: {
      email: "alice@stanford.edu",
      passwordHash,
      name: "Alice Chen",
      collegeName: "Stanford University",
      department: "Computer Science",
      graduationYear: 2026,
      hostel: "Kimball Hall",
      avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=AC",
      bio: "CS major, coffee enthusiast ☕",
      isVerified: true,
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@mit.edu",
      passwordHash,
      name: "Bob Johnson",
      collegeName: "MIT",
      department: "Electrical Engineering",
      graduationYear: 2025,
      hostel: "Baker House",
      avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=BJ",
      bio: "EE + robotics nerd 🤖",
      isVerified: true,
    },
  });

  const carol = await prisma.user.create({
    data: {
      email: "carol@berkeley.edu",
      passwordHash,
      name: "Carol Martinez",
      collegeName: "UC Berkeley",
      department: "Biology",
      graduationYear: 2027,
      avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=CM",
      bio: "Pre-med student & bookworm 📖",
      isVerified: true,
    },
  });

  const dave = await prisma.user.create({
    data: {
      email: "dave@harvard.edu",
      passwordHash,
      name: "Dave Kim",
      collegeName: "Harvard University",
      department: "Economics",
      graduationYear: 2026,
      hostel: "Dunster House",
      avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=DK",
      bio: "Economics major with minor in data science.",
      isVerified: true,
    },
  });

  console.log("✅ Created 5 users (1 admin + 4 students)");

  // ─── Items ──────────────────────────────────────────────────────────────────
  const items = await Promise.all([
    prisma.item.create({
      data: {
        title: "Calculus: Early Transcendentals 8th Edition",
        description: "Barely used Stewart calculus textbook. Perfect for MATH 101/102. No highlights or markings. Comes with online access code (unused).",
        category: "TEXTBOOKS",
        price: 45,
        condition: "LIKE_NEW",
        images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400"],
        campusZone: "Library Foyer",
        sellerId: alice.id,
      },
    }),
    prisma.item.create({
      data: {
        title: "Introduction to Algorithms (CLRS) 4th Edition",
        description: "The classic algorithms textbook. Some highlighting in chapters 1-12. Otherwise in great condition. Essential for any CS student.",
        category: "TEXTBOOKS",
        price: 55,
        condition: "GOOD",
        images: ["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400"],
        campusZone: "Student Union",
        sellerId: bob.id,
      },
    }),
    prisma.item.create({
      data: {
        title: "TI-84 Plus CE Graphing Calculator",
        description: "Works perfectly. Fresh batteries included. Great for math, engineering, and science courses. Color display model.",
        category: "ELECTRONICS",
        price: 65,
        condition: "GOOD",
        images: ["https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400"],
        campusZone: "Engineering Block Entrance",
        sellerId: alice.id,
      },
    }),
    prisma.item.create({
      data: {
        title: 'Dell 24" USB-C Monitor',
        description: "Excellent condition Dell P2422H monitor. USB-C connectivity, adjustable stand, 1080p IPS panel. Perfect for study setup or dual monitor config.",
        category: "ELECTRONICS",
        price: 120,
        condition: "LIKE_NEW",
        images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400"],
        campusZone: "Main Cafeteria",
        sellerId: bob.id,
      },
    }),
    prisma.item.create({
      data: {
        title: "Compact Mini-Fridge (3.2 cu ft)",
        description: "Perfect dorm fridge. Fits under desk. Barely used for one semester. Separate freezer compartment. Energy efficient.",
        category: "DORM_ESSENTIALS",
        price: 80,
        condition: "GOOD",
        images: ["https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400"],
        campusZone: "Student Union",
        sellerId: carol.id,
      },
    }),
    prisma.item.create({
      data: {
        title: "LED Desk Lamp with USB Charging Port",
        description: "Adjustable brightness, color temperature control, built-in USB-A port for phone charging. Clamp mount for desk edge.",
        category: "DORM_ESSENTIALS",
        price: 25,
        condition: "BRAND_NEW",
        images: ["https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400"],
        campusZone: "Library Foyer",
        sellerId: dave.id,
      },
    }),
    prisma.item.create({
      data: {
        title: "Twin XL Bedsheet Set - Navy Blue",
        description: "Brand new, never opened. 100% cotton, 400 thread count. Fits standard dorm mattress. Includes fitted sheet, flat sheet, and two pillowcases.",
        category: "DORM_ESSENTIALS",
        price: 0,
        condition: "BRAND_NEW",
        images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400"],
        campusZone: "Main Cafeteria",
        sellerId: carol.id,
      },
    }),
    prisma.item.create({
      data: {
        title: "Organic Chemistry Molecular Model Kit",
        description: "Complete model kit for Organic Chemistry I & II. All atoms and bonds present. Great for visualizing stereochemistry and molecular geometry.",
        category: "TEXTBOOKS",
        price: 20,
        condition: "GOOD",
        images: ["https://images.unsplash.com/photo-1532634993-15f421e42ec0?w=400"],
        campusZone: "Engineering Block Entrance",
        sellerId: carol.id,
      },
    }),
    prisma.item.create({
      data: {
        title: "MacBook Pro Charger (96W USB-C)",
        description: "Original Apple charger. Works with 15\" and 16\" MacBook Pro models. No fraying, cable in great condition.",
        category: "ELECTRONICS",
        price: 35,
        condition: "GOOD",
        images: ["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400"],
        sellerId: dave.id,
      },
    }),
    prisma.item.create({
      data: {
        title: "FREE - Box of Miscellaneous School Supplies",
        description: "Graduating and cleaning out! Includes notebooks, pens, highlighters, sticky notes, binder clips, and a stapler. First come, first serve!",
        category: "FREE_DONATIONS",
        price: 0,
        condition: "FAIR",
        images: ["https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400"],
        campusZone: "Student Union",
        sellerId: alice.id,
      },
    }),
    prisma.item.create({
      data: {
        title: "Physics: Principles with Applications (Giancoli)",
        description: "Used for PHYS 101-102 sequence. Some wear on cover but pages are clean. Seventh edition, international version.",
        category: "TEXTBOOKS",
        price: 30,
        condition: "FAIR",
        images: ["https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400"],
        campusZone: "Sports Complex Gate",
        sellerId: dave.id,
      },
    }),
    prisma.item.create({
      data: {
        title: "Wireless Noise-Cancelling Headphones",
        description: "Sony WH-1000XM4. Amazing sound quality and ANC. Includes carrying case, audio cable, and USB-C charging cable. Battery still holds 30hrs.",
        category: "ELECTRONICS",
        price: 150,
        condition: "LIKE_NEW",
        images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400"],
        campusZone: "Library Foyer",
        sellerId: bob.id,
      },
    }),
  ]);

  console.log(`✅ Created ${items.length} items across all categories`);

  // ─── Notes ──────────────────────────────────────────────────────────────────
  const notes = await Promise.all([
    prisma.note.create({
      data: {
        title: "Data Structures & Algorithms - Complete Notes",
        description: "Comprehensive notes covering arrays, linked lists, trees, graphs, sorting algorithms, dynamic programming, and Big-O analysis. Includes practice problems.",
        department: "Computer Science",
        fileUrl: "https://example.com/notes/cs201-dsa-notes.pdf",
        uploaderId: alice.id,
        upvotes: 24,
        downvotes: 2,
      },
    }),
    prisma.note.create({
      data: {
        title: "Organic Chemistry II - Reaction Mechanisms",
        description: "Detailed notes on all major reaction mechanisms including SN1, SN2, E1, E2, addition reactions, and aromatic chemistry. Color-coded diagrams.",
        department: "Chemistry",
        fileUrl: "https://example.com/notes/chem202-mechanisms.pdf",
        uploaderId: carol.id,
        upvotes: 18,
        downvotes: 1,
      },
    }),
    prisma.note.create({
      data: {
        title: "Microeconomics Midterm Review",
        description: "Condensed review notes for midterm exam. Covers supply & demand, elasticity, consumer theory, production costs, and market structures.",
        department: "Economics",
        fileUrl: "https://example.com/notes/econ101-midterm-review.pdf",
        uploaderId: dave.id,
        upvotes: 12,
        downvotes: 0,
      },
    }),
    prisma.note.create({
      data: {
        title: "Linear Algebra - Eigenvalues & Eigenvectors",
        description: "Step-by-step worked examples for finding eigenvalues, eigenvectors, diagonalization, and applications. Includes practice problems with solutions.",
        department: "Mathematics",
        fileUrl: "https://example.com/notes/math202-eigen.pdf",
        uploaderId: bob.id,
        upvotes: 15,
        downvotes: 3,
      },
    }),
    prisma.note.create({
      data: {
        title: "General Biology - Cell Biology & Genetics",
        description: "Lecture notes covering cell structure, mitosis/meiosis, DNA replication, transcription, translation, and Mendelian genetics.",
        department: "Biology",
        fileUrl: "https://example.com/notes/bio101-cells-genetics.pdf",
        uploaderId: carol.id,
        upvotes: 9,
        downvotes: 1,
      },
    }),
  ]);

  console.log(`✅ Created ${notes.length} study notes`);

  // ─── Conversations & Messages ───────────────────────────────────────────────
  const convo1 = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: alice.id },
          { userId: bob.id },
        ],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      { conversationId: convo1.id, senderId: bob.id, text: "Hey! Is the CLRS textbook still available?", messageType: "TEXT" },
      { conversationId: convo1.id, senderId: alice.id, text: "Yes, it is! Are you interested?", messageType: "TEXT" },
      { conversationId: convo1.id, senderId: bob.id, text: "💰 Made an offer: $45", messageType: "OFFER" },
      { conversationId: convo1.id, senderId: alice.id, text: "I can do $50. It's in really good condition.", messageType: "TEXT" },
      { conversationId: convo1.id, senderId: bob.id, text: "Deal! Can we meet at the Library Foyer tomorrow at 3pm?", messageType: "TEXT" },
      { conversationId: convo1.id, senderId: alice.id, text: "Perfect, see you there!", messageType: "TEXT" },
    ],
  });

  const convo2 = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: carol.id },
          { userId: dave.id },
        ],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      { conversationId: convo2.id, senderId: dave.id, text: "Hi! Is the mini-fridge still up for grabs?", messageType: "TEXT" },
      { conversationId: convo2.id, senderId: carol.id, text: "Yes! It's working great. Would you like to see it first?", messageType: "TEXT" },
      { conversationId: convo2.id, senderId: dave.id, text: "That'd be great. How about the Student Union this afternoon?", messageType: "TEXT" },
    ],
  });

  console.log("✅ Created 2 conversations with messages");

  // ─── Reviews ────────────────────────────────────────────────────────────────
  // First, mark the CLRS textbook as sold
  await prisma.item.update({ where: { id: items[1].id }, data: { status: "SOLD" } });

  await prisma.review.create({
    data: {
      reviewerId: alice.id,
      sellerId: bob.id,
      itemId: items[1].id,
      rating: 5,
      comment: "Great condition textbook, exactly as described. Bob was very punctual at the meetup. Highly recommended seller!",
    },
  });

  // Update Bob's rating
  await prisma.user.update({
    where: { id: bob.id },
    data: { rating: 5, reviewCount: 1 },
  });

  console.log("✅ Created 1 review");

  // ─── Summary ────────────────────────────────────────────────────────────────
  const totalUsers = await prisma.user.count();
  const totalItems = await prisma.item.count();
  const totalNotes = await prisma.note.count();
  const totalMessages = await prisma.message.count();
  const totalReviews = await prisma.review.count();

  console.log("\n📊 Seed Summary:");
  console.log(`   Users: ${totalUsers}`);
  console.log(`   Items: ${totalItems}`);
  console.log(`   Notes: ${totalNotes}`);
  console.log(`   Messages: ${totalMessages}`);
  console.log(`   Reviews: ${totalReviews}`);
  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Demo Credentials:");
  console.log("   Admin:   admin@university.edu / password123");
  console.log("   Alice:   alice@stanford.edu / password123");
  console.log("   Bob:     bob@mit.edu / password123");
  console.log("   Carol:   carol@berkeley.edu / password123");
  console.log("   Dave:    dave@harvard.edu / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
