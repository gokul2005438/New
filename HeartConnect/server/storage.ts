// Blueprint reference: javascript_log_in_with_replit, javascript_database
import {
  users,
  profiles,
  swipes,
  matches,
  messages,
  reports,
  blocks,
  dailySwipes,
  type User,
  type UpsertUser,
  type Profile,
  type InsertProfile,
  type Swipe,
  type InsertSwipe,
  type Match,
  type Message,
  type InsertMessage,
  type Report,
  type InsertReport,
  type Block,
  type DailySwipe,
  type UserWithProfile,
  type MatchWithUsers,
  type MessageWithSender,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, not, inArray, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Profile operations
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile | undefined>;
  getUserWithProfile(userId: string): Promise<UserWithProfile | undefined>;
  
  // Discovery operations
  getPotentialMatches(userId: string, limit?: number): Promise<UserWithProfile[]>;
  
  // Swipe operations
  createSwipe(swipe: InsertSwipe): Promise<{ swipe: Swipe; isMatch: boolean }>;
  getSwipesBetweenUsers(user1Id: string, user2Id: string): Promise<Swipe[]>;
  getDailySwipeCount(userId: string): Promise<number>;
  incrementDailySwipeCount(userId: string): Promise<void>;
  
  // Match operations
  createMatch(user1Id: string, user2Id: string): Promise<Match>;
  getMatchesForUser(userId: string): Promise<MatchWithUsers[]>;
  getMatch(matchId: string): Promise<MatchWithUsers | undefined>;
  getMatchBetweenUsers(user1Id: string, user2Id: string): Promise<Match | undefined>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesForMatch(matchId: string): Promise<MessageWithSender[]>;
  markMessagesAsRead(matchId: string, userId: string): Promise<void>;
  
  // Safety operations
  createReport(report: InsertReport): Promise<Report>;
  createBlock(blockerId: string, blockedId: string): Promise<Block>;
  getBlockedUsers(userId: string): Promise<string[]>;
  isUserBlocked(user1Id: string, user2Id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Profile operations
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(profileData: InsertProfile): Promise<Profile> {
    const [profile] = await db
      .insert(profiles)
      .values({
        ...profileData,
        isProfileComplete: true,
      })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: {
          ...profileData,
          isProfileComplete: true,
          updatedAt: new Date(),
        },
      })
      .returning();
    return profile;
  }

  async updateProfile(userId: string, profileData: Partial<InsertProfile>): Promise<Profile | undefined> {
    const [profile] = await db
      .update(profiles)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, userId))
      .returning();
    return profile;
  }

  async getUserWithProfile(userId: string): Promise<UserWithProfile | undefined> {
    const [result] = await db
      .select()
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.id, userId));
    
    if (!result) return undefined;
    
    return {
      ...result.users,
      profile: result.profiles,
    };
  }

  // Discovery operations
  async getPotentialMatches(userId: string, limit: number = 50): Promise<UserWithProfile[]> {
    const userProfile = await this.getProfile(userId);
    if (!userProfile) return [];

    // Get users the current user has already swiped on
    const existingSwipes = await db
      .select({ swipedId: swipes.swipedId })
      .from(swipes)
      .where(eq(swipes.swiperId, userId));
    
    const swipedUserIds = existingSwipes.map(s => s.swipedId);

    // Get blocked users
    const blockedUsers = await this.getBlockedUsers(userId);
    const allExcludedIds = [...swipedUserIds, ...blockedUsers, userId];

    // Find potential matches based on preferences
    const potentialUsers = await db
      .select()
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(
        and(
          not(inArray(users.id, allExcludedIds)),
          eq(profiles.isProfileComplete, true),
          // Age range filter
          userProfile.ageRangeMin ? sql`${profiles.age} >= ${userProfile.ageRangeMin}` : undefined,
          userProfile.ageRangeMax ? sql`${profiles.age} <= ${userProfile.ageRangeMax}` : undefined,
          // Looking for filter
          userProfile.lookingFor && userProfile.lookingFor !== 'everyone'
            ? eq(profiles.gender, userProfile.lookingFor)
            : undefined,
        )
      )
      .limit(limit);

    return potentialUsers
      .filter(r => r.profiles !== null)
      .map(r => ({
        ...r.users,
        profile: r.profiles!,
      }));
  }

  // Swipe operations
  async createSwipe(swipeData: InsertSwipe): Promise<{ swipe: Swipe; isMatch: boolean }> {
    const [swipe] = await db
      .insert(swipes)
      .values(swipeData)
      .returning();

    let isMatch = false;

    // Check if this is a mutual like
    if (swipeData.direction === 'like') {
      const [reciprocalSwipe] = await db
        .select()
        .from(swipes)
        .where(
          and(
            eq(swipes.swiperId, swipeData.swipedId),
            eq(swipes.swipedId, swipeData.swiperId),
            eq(swipes.direction, 'like')
          )
        );

      if (reciprocalSwipe) {
        // Create a match
        await this.createMatch(swipeData.swiperId, swipeData.swipedId);
        isMatch = true;
      }
    }

    return { swipe, isMatch };
  }

  async getSwipesBetweenUsers(user1Id: string, user2Id: string): Promise<Swipe[]> {
    return await db
      .select()
      .from(swipes)
      .where(
        or(
          and(eq(swipes.swiperId, user1Id), eq(swipes.swipedId, user2Id)),
          and(eq(swipes.swiperId, user2Id), eq(swipes.swipedId, user1Id))
        )
      );
  }

  async getDailySwipeCount(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const [result] = await db
      .select()
      .from(dailySwipes)
      .where(
        and(
          eq(dailySwipes.userId, userId),
          eq(dailySwipes.date, today)
        )
      );

    return result?.count || 0;
  }

  async incrementDailySwipeCount(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    const [existing] = await db
      .select()
      .from(dailySwipes)
      .where(
        and(
          eq(dailySwipes.userId, userId),
          eq(dailySwipes.date, today)
        )
      );

    if (existing) {
      await db
        .update(dailySwipes)
        .set({ count: existing.count + 1 })
        .where(eq(dailySwipes.id, existing.id));
    } else {
      await db
        .insert(dailySwipes)
        .values({
          userId,
          date: today,
          count: 1,
        });
    }
  }

  // Match operations
  async createMatch(user1Id: string, user2Id: string): Promise<Match> {
    const [match] = await db
      .insert(matches)
      .values({ user1Id, user2Id })
      .returning();
    return match;
  }

  async getMatchesForUser(userId: string): Promise<MatchWithUsers[]> {
    const results = await db
      .select()
      .from(matches)
      .where(
        or(
          eq(matches.user1Id, userId),
          eq(matches.user2Id, userId)
        )
      )
      .orderBy(desc(matches.createdAt));

    const matchesWithUsers: MatchWithUsers[] = [];

    for (const match of results) {
      const user1 = await this.getUserWithProfile(match.user1Id);
      const user2 = await this.getUserWithProfile(match.user2Id);

      if (user1 && user2) {
        matchesWithUsers.push({
          ...match,
          user1,
          user2,
        });
      }
    }

    return matchesWithUsers;
  }

  async getMatch(matchId: string): Promise<MatchWithUsers | undefined> {
    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, matchId));

    if (!match) return undefined;

    const user1 = await this.getUserWithProfile(match.user1Id);
    const user2 = await this.getUserWithProfile(match.user2Id);

    if (!user1 || !user2) return undefined;

    return {
      ...match,
      user1,
      user2,
    };
  }

  async getMatchBetweenUsers(user1Id: string, user2Id: string): Promise<Match | undefined> {
    const [match] = await db
      .select()
      .from(matches)
      .where(
        or(
          and(eq(matches.user1Id, user1Id), eq(matches.user2Id, user2Id)),
          and(eq(matches.user1Id, user2Id), eq(matches.user2Id, user1Id))
        )
      );
    return match;
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();
    return message;
  }

  async getMessagesForMatch(matchId: string): Promise<MessageWithSender[]> {
    const results = await db
      .select()
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.matchId, matchId))
      .orderBy(messages.createdAt);

    return results
      .filter(r => r.users !== null)
      .map(r => ({
        ...r.messages,
        sender: r.users!,
      }));
  }

  async markMessagesAsRead(matchId: string, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.matchId, matchId),
          not(eq(messages.senderId, userId))
        )
      );
  }

  // Safety operations
  async createReport(reportData: InsertReport): Promise<Report> {
    const [report] = await db
      .insert(reports)
      .values(reportData)
      .returning();
    return report;
  }

  async createBlock(blockerId: string, blockedId: string): Promise<Block> {
    const [block] = await db
      .insert(blocks)
      .values({ blockerId, blockedId })
      .returning();
    return block;
  }

  async getBlockedUsers(userId: string): Promise<string[]> {
    const blockedByUser = await db
      .select({ blockedId: blocks.blockedId })
      .from(blocks)
      .where(eq(blocks.blockerId, userId));

    const blockedUser = await db
      .select({ blockerId: blocks.blockerId })
      .from(blocks)
      .where(eq(blocks.blockedId, userId));

    return [
      ...blockedByUser.map(b => b.blockedId),
      ...blockedUser.map(b => b.blockerId),
    ];
  }

  async isUserBlocked(user1Id: string, user2Id: string): Promise<boolean> {
    const [block] = await db
      .select()
      .from(blocks)
      .where(
        or(
          and(eq(blocks.blockerId, user1Id), eq(blocks.blockedId, user2Id)),
          and(eq(blocks.blockerId, user2Id), eq(blocks.blockedId, user1Id))
        )
      );
    return !!block;
  }
}

export const storage = new DatabaseStorage();
