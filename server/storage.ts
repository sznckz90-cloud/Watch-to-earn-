import { db } from "./db";
import {
  users,
  type User,
  type InsertUser,
  type UpdateUser
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getUser(userId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(userId: string, updates: UpdateUser): Promise<User>;
  getAllActiveUsers(): Promise<User[]>;
  getStats(): Promise<{ activeUsers: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(userId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.userId, userId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(userId: string, updates: UpdateUser): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.userId, userId))
      .returning();
    return user;
  }

  async getAllActiveUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isActive, true));
  }

  async getStats(): Promise<{ activeUsers: number }> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.isActive, true));
    return { activeUsers: Number(result?.count || 0) };
  }
}

export const storage = new DatabaseStorage();
