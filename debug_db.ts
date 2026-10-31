import prisma from './src/lib/prisma';

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users count:', users.length);
    if (users.length > 0) {
      console.log('Example User ID:', users[0].id);
    }
    const items = await prisma.item.findMany();
    console.log('Items count:', items.length);
  } catch (e) {
    console.error('Database error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
