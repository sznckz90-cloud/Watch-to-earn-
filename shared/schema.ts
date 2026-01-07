import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// This table mirrors the requested Firestore structure
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(), // Telegram User ID
  channelId: text("channel_id").notNull(),
  coinSymbol: text("coin_symbol").notNull().default("BTC"),
  intervalMinutes: integer("interval_minutes").notNull().default(60),
  isActive: boolean("is_active").notNull().default(true),
  lastPostedAt: timestamp("last_posted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastPostedAt: true
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = Partial<InsertUser>;

// For the frontend status display
export type BotStats = {
  activeUsers: number;
  totalUpdatesSent: number; // We might not track this in DB for simplicity, but good for type
  uptime: number;
};
