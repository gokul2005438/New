var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  blocks: () => blocks,
  dailySwipes: () => dailySwipes,
  insertMessageSchema: () => insertMessageSchema,
  insertProfileSchema: () => insertProfileSchema,
  insertReportSchema: () => insertReportSchema,
  insertSwipeSchema: () => insertSwipeSchema,
  matches: () => matches,
  matchesRelations: () => matchesRelations,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  profiles: () => profiles,
  profilesRelations: () => profilesRelations,
  reports: () => reports,
  sessions: () => sessions,
  swipes: () => swipes,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
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
  maxDistance: integer("max_distance").default(50),
  // in km
  // Premium features
  isPremium: boolean("is_premium").default(false),
  // Profile completion
  isProfileComplete: boolean("is_profile_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var swipes = pgTable("swipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  swiperId: varchar("swiper_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  swipedId: varchar("swiped_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  direction: varchar("direction", { length: 10 }).notNull(),
  // 'like' or 'pass'
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("swipes_swiper_idx").on(table.swiperId),
  index("swipes_swiped_idx").on(table.swipedId)
]);
var matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  user2Id: varchar("user2_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("matches_user1_idx").on(table.user1Id),
  index("matches_user2_idx").on(table.user2Id)
]);
var messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("messages_match_idx").on(table.matchId),
  index("messages_created_idx").on(table.createdAt)
]);
var reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reportedId: varchar("reported_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reason: varchar("reason", { length: 50 }).notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow()
});
var blocks = pgTable("blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockerId: varchar("blocker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  blockedId: varchar("blocked_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("blocks_blocker_idx").on(table.blockerId)
]);
var dailySwipes = pgTable("daily_swipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: varchar("date", { length: 10 }).notNull(),
  // YYYY-MM-DD
  count: integer("count").default(0)
}, (table) => [
  index("daily_swipes_user_date_idx").on(table.userId, table.date)
]);
var usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId]
  })
}));
var profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id]
  })
}));
var matchesRelations = relations(matches, ({ one, many }) => ({
  user1: one(users, {
    fields: [matches.user1Id],
    references: [users.id]
  }),
  user2: one(users, {
    fields: [matches.user2Id],
    references: [users.id]
  }),
  messages: many(messages)
}));
var messagesRelations = relations(messages, ({ one }) => ({
  match: one(matches, {
    fields: [messages.matchId],
    references: [matches.id]
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id]
  })
}));
var insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
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
  maxDistance: z.number().min(1).max(500).optional()
});
var insertSwipeSchema = createInsertSchema(swipes).omit({
  id: true,
  createdAt: true
}).extend({
  direction: z.enum(["like", "pass"])
});
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true
}).extend({
  content: z.string().min(1).max(1e3)
});
var insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true
}).extend({
  reason: z.enum(["inappropriate", "scam", "fake", "harassment", "other"]),
  details: z.string().max(500).optional()
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and, or, not, inArray, desc, sql as sql2 } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // Profile operations
  async getProfile(userId) {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }
  async createProfile(profileData) {
    const [profile] = await db.insert(profiles).values({
      ...profileData,
      isProfileComplete: true
    }).onConflictDoUpdate({
      target: profiles.userId,
      set: {
        ...profileData,
        isProfileComplete: true,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return profile;
  }
  async updateProfile(userId, profileData) {
    const [profile] = await db.update(profiles).set({
      ...profileData,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(profiles.userId, userId)).returning();
    return profile;
  }
  async getUserWithProfile(userId) {
    const [result] = await db.select().from(users).leftJoin(profiles, eq(users.id, profiles.userId)).where(eq(users.id, userId));
    if (!result) return void 0;
    return {
      ...result.users,
      profile: result.profiles
    };
  }
  // Discovery operations
  async getPotentialMatches(userId, limit = 50) {
    const userProfile = await this.getProfile(userId);
    if (!userProfile) return [];
    const existingSwipes = await db.select({ swipedId: swipes.swipedId }).from(swipes).where(eq(swipes.swiperId, userId));
    const swipedUserIds = existingSwipes.map((s) => s.swipedId);
    const blockedUsers = await this.getBlockedUsers(userId);
    const allExcludedIds = [...swipedUserIds, ...blockedUsers, userId];
    const potentialUsers = await db.select().from(users).leftJoin(profiles, eq(users.id, profiles.userId)).where(
      and(
        not(inArray(users.id, allExcludedIds)),
        eq(profiles.isProfileComplete, true),
        // Age range filter
        userProfile.ageRangeMin ? sql2`${profiles.age} >= ${userProfile.ageRangeMin}` : void 0,
        userProfile.ageRangeMax ? sql2`${profiles.age} <= ${userProfile.ageRangeMax}` : void 0,
        // Looking for filter
        userProfile.lookingFor && userProfile.lookingFor !== "everyone" ? eq(profiles.gender, userProfile.lookingFor) : void 0
      )
    ).limit(limit);
    return potentialUsers.filter((r) => r.profiles !== null).map((r) => ({
      ...r.users,
      profile: r.profiles
    }));
  }
  // Swipe operations
  async createSwipe(swipeData) {
    const [swipe] = await db.insert(swipes).values(swipeData).returning();
    let isMatch = false;
    if (swipeData.direction === "like") {
      const [reciprocalSwipe] = await db.select().from(swipes).where(
        and(
          eq(swipes.swiperId, swipeData.swipedId),
          eq(swipes.swipedId, swipeData.swiperId),
          eq(swipes.direction, "like")
        )
      );
      if (reciprocalSwipe) {
        await this.createMatch(swipeData.swiperId, swipeData.swipedId);
        isMatch = true;
      }
    }
    return { swipe, isMatch };
  }
  async getSwipesBetweenUsers(user1Id, user2Id) {
    return await db.select().from(swipes).where(
      or(
        and(eq(swipes.swiperId, user1Id), eq(swipes.swipedId, user2Id)),
        and(eq(swipes.swiperId, user2Id), eq(swipes.swipedId, user1Id))
      )
    );
  }
  async getDailySwipeCount(userId) {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const [result] = await db.select().from(dailySwipes).where(
      and(
        eq(dailySwipes.userId, userId),
        eq(dailySwipes.date, today)
      )
    );
    return result?.count || 0;
  }
  async incrementDailySwipeCount(userId) {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const [existing] = await db.select().from(dailySwipes).where(
      and(
        eq(dailySwipes.userId, userId),
        eq(dailySwipes.date, today)
      )
    );
    if (existing) {
      await db.update(dailySwipes).set({ count: existing.count + 1 }).where(eq(dailySwipes.id, existing.id));
    } else {
      await db.insert(dailySwipes).values({
        userId,
        date: today,
        count: 1
      });
    }
  }
  // Match operations
  async createMatch(user1Id, user2Id) {
    const [match] = await db.insert(matches).values({ user1Id, user2Id }).returning();
    return match;
  }
  async getMatchesForUser(userId) {
    const results = await db.select().from(matches).where(
      or(
        eq(matches.user1Id, userId),
        eq(matches.user2Id, userId)
      )
    ).orderBy(desc(matches.createdAt));
    const matchesWithUsers = [];
    for (const match of results) {
      const user1 = await this.getUserWithProfile(match.user1Id);
      const user2 = await this.getUserWithProfile(match.user2Id);
      if (user1 && user2) {
        matchesWithUsers.push({
          ...match,
          user1,
          user2
        });
      }
    }
    return matchesWithUsers;
  }
  async getMatch(matchId) {
    const [match] = await db.select().from(matches).where(eq(matches.id, matchId));
    if (!match) return void 0;
    const user1 = await this.getUserWithProfile(match.user1Id);
    const user2 = await this.getUserWithProfile(match.user2Id);
    if (!user1 || !user2) return void 0;
    return {
      ...match,
      user1,
      user2
    };
  }
  async getMatchBetweenUsers(user1Id, user2Id) {
    const [match] = await db.select().from(matches).where(
      or(
        and(eq(matches.user1Id, user1Id), eq(matches.user2Id, user2Id)),
        and(eq(matches.user1Id, user2Id), eq(matches.user2Id, user1Id))
      )
    );
    return match;
  }
  // Message operations
  async createMessage(messageData) {
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }
  async getMessagesForMatch(matchId) {
    const results = await db.select().from(messages).leftJoin(users, eq(messages.senderId, users.id)).where(eq(messages.matchId, matchId)).orderBy(messages.createdAt);
    return results.filter((r) => r.users !== null).map((r) => ({
      ...r.messages,
      sender: r.users
    }));
  }
  async markMessagesAsRead(matchId, userId) {
    await db.update(messages).set({ isRead: true }).where(
      and(
        eq(messages.matchId, matchId),
        not(eq(messages.senderId, userId))
      )
    );
  }
  // Safety operations
  async createReport(reportData) {
    const [report] = await db.insert(reports).values(reportData).returning();
    return report;
  }
  async createBlock(blockerId, blockedId) {
    const [block] = await db.insert(blocks).values({ blockerId, blockedId }).returning();
    return block;
  }
  async getBlockedUsers(userId) {
    const blockedByUser = await db.select({ blockedId: blocks.blockedId }).from(blocks).where(eq(blocks.blockerId, userId));
    const blockedUser = await db.select({ blockerId: blocks.blockerId }).from(blocks).where(eq(blocks.blockedId, userId));
    return [
      ...blockedByUser.map((b) => b.blockedId),
      ...blockedUser.map((b) => b.blockerId)
    ];
  }
  async isUserBlocked(user1Id, user2Id) {
    const [block] = await db.select().from(blocks).where(
      or(
        and(eq(blocks.blockerId, user1Id), eq(blocks.blockedId, user2Id)),
        and(eq(blocks.blockerId, user2Id), eq(blocks.blockedId, user1Id))
      )
    );
    return !!block;
  }
};
var storage = new DatabaseStorage();

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  const user = req.user;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// server/routes.ts
import { fromError } from "zod-validation-error";
var DAILY_SWIPE_LIMIT = 10;
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/profiles/me", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  app2.post("/api/profiles", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertProfileSchema.safeParse({ ...req.body, userId });
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }
      const profile = await storage.createProfile(validation.data);
      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });
  app2.get("/api/profiles/:id", isAuthenticated, async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  app2.get("/api/discover", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (!profile || !profile.isProfileComplete) {
        return res.status(403).json({ message: "Please complete your profile first" });
      }
      const potentialMatches = await storage.getPotentialMatches(userId);
      res.json(potentialMatches);
    } catch (error) {
      console.error("Error fetching potential matches:", error);
      res.status(500).json({ message: "Failed to fetch potential matches" });
    }
  });
  app2.get("/api/swipes/daily", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      const count = await storage.getDailySwipeCount(userId);
      const limit = profile?.isPremium ? Infinity : DAILY_SWIPE_LIMIT;
      res.json({ count, limit: profile?.isPremium ? null : limit });
    } catch (error) {
      console.error("Error fetching daily swipe count:", error);
      res.status(500).json({ message: "Failed to fetch swipe count" });
    }
  });
  app2.post("/api/swipes", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertSwipeSchema.safeParse({ ...req.body, swiperId: userId });
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }
      const profile = await storage.getProfile(userId);
      if (!profile?.isPremium) {
        const dailyCount = await storage.getDailySwipeCount(userId);
        if (dailyCount >= DAILY_SWIPE_LIMIT) {
          return res.status(429).json({
            message: "Daily swipe limit reached. Upgrade to Premium for unlimited swipes!"
          });
        }
      }
      const isBlocked = await storage.isUserBlocked(userId, validation.data.swipedId);
      if (isBlocked) {
        return res.status(403).json({ message: "Cannot swipe on this user" });
      }
      const { swipe, isMatch } = await storage.createSwipe(validation.data);
      await storage.incrementDailySwipeCount(userId);
      res.json({ swipe, isMatch });
    } catch (error) {
      console.error("Error creating swipe:", error);
      res.status(500).json({ message: "Failed to create swipe" });
    }
  });
  app2.get("/api/matches", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const matches2 = await storage.getMatchesForUser(userId);
      res.json(matches2);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });
  app2.get("/api/matches/:matchId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const match = await storage.getMatch(req.params.matchId);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      if (match.user1Id !== userId && match.user2Id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      res.json(match);
    } catch (error) {
      console.error("Error fetching match:", error);
      res.status(500).json({ message: "Failed to fetch match" });
    }
  });
  app2.get("/api/messages/:matchId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const match = await storage.getMatch(req.params.matchId);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      if (match.user1Id !== userId && match.user2Id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const messages2 = await storage.getMessagesForMatch(req.params.matchId);
      await storage.markMessagesAsRead(req.params.matchId, userId);
      res.json(messages2);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.post("/api/matches/:matchId/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const match = await storage.getMatch(req.params.matchId);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      if (match.user1Id !== userId && match.user2Id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const validation = insertMessageSchema.safeParse({
        ...req.body,
        matchId: req.params.matchId,
        senderId: userId
      });
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }
      const message = await storage.createMessage(validation.data);
      broadcastMessage(req.params.matchId, {
        type: "new_message",
        matchId: req.params.matchId,
        message
      });
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  app2.post("/api/reports", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertReportSchema.safeParse({ ...req.body, reporterId: userId });
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }
      const report = await storage.createReport(validation.data);
      res.json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });
  app2.post("/api/blocks", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { blockedId } = req.body;
      if (!blockedId) {
        return res.status(400).json({ message: "Blocked user ID is required" });
      }
      const block = await storage.createBlock(userId, blockedId);
      res.json(block);
    } catch (error) {
      console.error("Error creating block:", error);
      res.status(500).json({ message: "Failed to block user" });
    }
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const clients = /* @__PURE__ */ new Map();
  wss.on("connection", (ws2) => {
    console.log("WebSocket client connected");
    let currentMatchId = null;
    ws2.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "subscribe" && message.matchId) {
          currentMatchId = message.matchId;
          if (!clients.has(currentMatchId)) {
            clients.set(currentMatchId, /* @__PURE__ */ new Set());
          }
          clients.get(currentMatchId).add(ws2);
          console.log(`Client subscribed to match: ${currentMatchId}`);
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws2.on("close", () => {
      if (currentMatchId && clients.has(currentMatchId)) {
        clients.get(currentMatchId).delete(ws2);
        if (clients.get(currentMatchId).size === 0) {
          clients.delete(currentMatchId);
        }
      }
      console.log("WebSocket client disconnected");
    });
  });
  function broadcastMessage(matchId, data) {
    const matchClients = clients.get(matchId);
    if (matchClients) {
      const message = JSON.stringify(data);
      matchClients.forEach((client2) => {
        if (client2.readyState === WebSocket.OPEN) {
          client2.send(message);
        }
      });
    }
  }
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
