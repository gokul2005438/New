// Blueprint reference: javascript_log_in_with_replit, javascript_websocket
import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertProfileSchema,
  insertSwipeSchema,
  insertMessageSchema,
  insertReportSchema,
} from "@shared/schema";
import { fromError } from "zod-validation-error";

const DAILY_SWIPE_LIMIT = 10;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.get('/api/profiles/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/profiles', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/profiles/:id', isAuthenticated, async (req: any, res) => {
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

  // Discovery routes
  app.get('/api/discover', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check if user has a complete profile
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

  // Swipe routes
  app.get('/api/swipes/daily', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/swipes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertSwipeSchema.safeParse({ ...req.body, swiperId: userId });
      
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      // Check daily swipe limit for non-premium users
      const profile = await storage.getProfile(userId);
      if (!profile?.isPremium) {
        const dailyCount = await storage.getDailySwipeCount(userId);
        if (dailyCount >= DAILY_SWIPE_LIMIT) {
          return res.status(429).json({ 
            message: "Daily swipe limit reached. Upgrade to Premium for unlimited swipes!" 
          });
        }
      }

      // Check if users are blocked
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

  // Match routes
  app.get('/api/matches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matches = await storage.getMatchesForUser(userId);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  app.get('/api/matches/:matchId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const match = await storage.getMatch(req.params.matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      // Verify user is part of this match
      if (match.user1Id !== userId && match.user2Id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      res.json(match);
    } catch (error) {
      console.error("Error fetching match:", error);
      res.status(500).json({ message: "Failed to fetch match" });
    }
  });

  // Message routes
  app.get('/api/messages/:matchId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const match = await storage.getMatch(req.params.matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      // Verify user is part of this match
      if (match.user1Id !== userId && match.user2Id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const messages = await storage.getMessagesForMatch(req.params.matchId);
      
      // Mark messages as read
      await storage.markMessagesAsRead(req.params.matchId, userId);

      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/matches/:matchId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const match = await storage.getMatch(req.params.matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      // Verify user is part of this match
      if (match.user1Id !== userId && match.user2Id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const validation = insertMessageSchema.safeParse({
        ...req.body,
        matchId: req.params.matchId,
        senderId: userId,
      });

      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const message = await storage.createMessage(validation.data);

      // Broadcast to WebSocket clients
      broadcastMessage(req.params.matchId, {
        type: 'new_message',
        matchId: req.params.matchId,
        message,
      });

      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Safety routes
  app.post('/api/reports', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/blocks', isAuthenticated, async (req: any, res) => {
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

  // Create HTTP server
  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const clients = new Map<string, Set<WebSocket>>();

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    let currentMatchId: string | null = null;

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'subscribe' && message.matchId) {
          currentMatchId = message.matchId;
          
          if (!clients.has(currentMatchId)) {
            clients.set(currentMatchId, new Set());
          }
          clients.get(currentMatchId)!.add(ws);

          console.log(`Client subscribed to match: ${currentMatchId}`);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (currentMatchId && clients.has(currentMatchId)) {
        clients.get(currentMatchId)!.delete(ws);
        
        if (clients.get(currentMatchId)!.size === 0) {
          clients.delete(currentMatchId);
        }
      }
      console.log('WebSocket client disconnected');
    });
  });

  function broadcastMessage(matchId: string, data: any) {
    const matchClients = clients.get(matchId);
    if (matchClients) {
      const message = JSON.stringify(data);
      matchClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  return httpServer;
}
