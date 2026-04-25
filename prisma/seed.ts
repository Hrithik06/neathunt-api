/**
 * Load environment variables when this file is run directly
 * (Prisma CLI already loads .env, but tsx execution does not)
 */
import "dotenv/config";

import { PrismaClient } from "../src/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * IMPORTANT CONCEPT:
 *
 * This script should behave exactly like your real server.
 * So we reuse the SAME connection setup:
 *
 * Express → Prisma → pg → Supabase pool → Postgres
 *
 * Not the DIRECT_URL (that is only for migrations).
 */

/**
 * pg.Pool keeps a few TCP sockets open to Supabase's pooler.
 * This does NOT replace Supabase pooling — it only avoids
 * opening a new network connection for every query.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Very important for Supabase connection limits
  // Prevents exhausting available connections
  max: 5,

  idleTimeoutMillis: 30000,
});

/**
 * Prisma adapter:
 * Prisma generates SQL.
 * The pg driver actually sends SQL to Postgres.
 */
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  /**
   * We only wipe local/dev data.
   * NEVER automatically wipe production database.
   *
   * Why?
   * A seed script is often run during deployment.
   * Accidentally deleting real users would be catastrophic.
   */
  if (process.env.NODE_ENV !== "production") {
    await prisma.user.deleteMany();
  }

  /**
   * Seed users
   * These simulate Google OAuth users.
   *
   * googleId represents the OAuth 'sub' claim —
   * the stable identity that NEVER changes.
   */
  const users = [
    {
      googleId: "google-demo-1",
      email: "alice.demo@gmail.com",
      name: "Alice Demo",
      picture: "https://i.pravatar.cc/150?img=1",
      scopes: ["openid", "email", "profile"],
    },
    {
      googleId: "google-demo-2",
      email: "bob.demo@gmail.com",
      name: "Bob Demo",
      picture: "https://i.pravatar.cc/150?img=2",
      scopes: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/gmail.readonly",
      ],
      automaticTracking: true, // 👈 Gmail enabled user
    },
    {
      googleId: "google-demo-3",
      email: "charlie.demo@gmail.com",
      name: "Charlie Demo",
      picture: "https://i.pravatar.cc/150?img=3",
      scopes: ["openid", "email", "profile"],
    },
  ];

  /**
   * Promise.all allows parallel DB operations.
   * Without this, each insert waits for the previous one.
   *
   * The pool size (max:5) still protects the database.
   */
  await Promise.all(
    users.map((userData) =>
      prisma.user.upsert({
        /**
            upsert = create if not exists, update if exists
            This makes seed SAFE to run multiple times.
         * CRITICAL:
         * We match on googleId — NOT email.
         *
         * Email can change.
         * Google identity (sub) never changes.
         *
         * This prevents duplicate accounts and "lost data" bugs.
         */
        where: { googleId: userData.googleId },

        // If user already exists → do nothing
        update: {},

        // If user does not exist → create it
        create: userData,
      }),
    ),
  );
  const allUsers = await prisma.user.findMany();

  // --- JOBS ---
  await Promise.all(
    allUsers.map(async (user) => {
      const jobs = [
        {
          userId: user.id,
          company: "Google",
          title: "Frontend Engineer",
          status: "APPLIED",
          source: "MANUAL",
          notes: "Applied via careers page",
        },
        {
          userId: user.id,
          company: "Microsoft",
          title: "Software Engineer",
          status: "REJECTED",
          source: "MANUAL",
          notes: "Rejected after OA",
        },
      ];

      // Only add Gmail jobs if user has enabled tracking
      if (user.automaticTracking) {
        jobs.push({
          userId: user.id,
          company: "Amazon",
          title: "SDE I",
          status: "INTERVIEW_SCHEDULED",
          source: "GMAIL_AUTO",
          emailMessageId: `msg-${user.id}-1`,
          emailThreadId: `thread-${user.id}-1`,
          emailSubject: "Your application at Amazon",
        });
      }

      return prisma.job.createMany({ data: jobs });
    }),
  );
  console.log("✅ Seed completed successfully");
}

/**
 * Proper shutdown handling
 * (very important for Node scripts using DB connections)
 */
main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma query engine
    await prisma.$disconnect();

    // close TCP sockets so Node process can exit
    await pool.end();
  });
