export function isDatabaseConnectionError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /Can't reach database|P1001|P1017|P1000|PrismaClientInitialization|ECONNREFUSED/i.test(
    message
  );
}

export function publicDatabaseError(): string {
  return "Cannot reach the database. In Vercel, set DATABASE_URL to a hosted Postgres URL (not localhost) and run prisma db push against that database.";
}
