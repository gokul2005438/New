import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Extended profile information for dating app
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  bio: text("bio"),
  age: integer("age").notNull(),
  gender: varchar("gender", { length: 50 }).notNull(),
  location: varchar("location", { length: 255 }),
  latitude: text("latitude"),
  longitude: text("longitude"),
  interests: text("interests").array(),
  photos: text("photos").array().notNull().default(sql`ARRAY[]::text[]`),
  
  // Preferences for matching
  lookingFor: varchar("looking_for", { length: 50 }),
  ageRangeMin: integer("age_range_min").default(18),
  ageRangeMax: integer("age_range_max").default(99),
  maxDistance: integer("max_distance").default(50), // in km
  
  // Premium features
  isPremium: boolean("is_premium").default(false),
  
  // Profile completion
  isProfileComplete: boolean("is_profile_complete").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Swipe actions (like/pass)
export const swipes = pgTable("swipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  swiperId: varchar("swiper_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  swipedId: varchar("swiped_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  direction: varchar("direction", { length: 10 }).notNull(), // 'like' or 'pass'
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("swipes_swiper_idx").on(table.swiperId),
  index("swipes_swiped_idx").on(table.swipedId),
]);

// Matches (mutual likes)
export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  user2Id: varchar("user2_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("matches_user1_idx").on(table.user1Id),
  index("matches_user2_idx").on(table.user2Id),
]);

// Chat messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull().references(() => matches.id, { onDelete: 'cascade' }),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("messages_match_idx").on(table.matchId),
  index("messages_created_idx").on(table.createdAt),
]);

// Reports for safety
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  reportedId: varchar("reported_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  reason: varchar("reason", { length: 50 }).notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blocked users
export const blocks = pgTable("blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockerId: varchar("blocker_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  blockedId: varchar("blocked_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("blocks_blocker_idx").on(table.blockerId),
]);

// Daily swipe tracking for free users
export const dailySwipes = pgTable("daily_swipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  count: integer("count").default(0),
}, (table) => [
  index("daily_swipes_user_date_idx").on(table.userId, table.date),
]);

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  user1: one(users, {
    fields: [matches.user1Id],
    references: [users.id],
  }),
  user2: one(users, {
    fields: [matches.user2Id],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  match: one(matches, {
    fields: [messages.matchId],
    references: [matches.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  bio: z.string().max(500).optional(),
  age: z.number().min(18).max(100),
  gender: z.string().min(1),
  location: z.string().optional(),
  interests: z.array(z.string()).optional(),
  photos: z.array(z.string()).min(1).max(9),
  lookingFor: z.string().optional(),
  ageRangeMin: z.number().min(18).max(100).optional(),
  ageRangeMax: z.number().min(18).max(100).optional(),
  maxDistance: z.number().min(1).max(500).optional(),
});

export const insertSwipeSchema = createInsertSchema(swipes).omit({
  id: true,
  createdAt: true,
}).extend({
  direction: z.enum(['like', 'pass']),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
}).extend({
  content: z.string().min(1).max(1000),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
}).extend({
  reason: z.enum(['inappropriate', 'scam', 'fake', 'harassment', 'other']),
  details: z.string().max(500).optional(),
});

// TypeScript types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Swipe = typeof swipes.$inferSelect;
export type InsertSwipe = z.infer<typeof insertSwipeSchema>;
export type Match = typeof matches.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Block = typeof blocks.$inferSelect;
export type DailySwipe = typeof dailySwipes.$inferSelect;

// Combined types for API responses
export type UserWithProfile = User & {
  profile: Profile | null;
};

export type MatchWithUsers = Match & {
  user1: UserWithProfile;
  user2: UserWithProfile;
};

export type MessageWithSender = Message & {
  sender: User;
};
