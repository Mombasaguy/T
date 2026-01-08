import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const userId = req.headers["x-user-id"] as string || req.cookies?.userId;
  
  if (!userId) {
    return res.status(401).json({ 
      error: "Authentication required",
      code: "AUTH_REQUIRED"
    });
  }
  
  req.userId = userId;
  next();
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const user = req.user as any;
  if (user?.claims?.sub) {
    req.userId = user.claims.sub;
  } else {
    req.userId = 'guest';
  }
  next();
}

export async function checkSearchLimit(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId || 'guest';
    let subscription = await storage.getSubscription(userId);
    
    // If no subscription exists, this is a new user - they have 0 searches used
    // The subscription will be created after the first successful search
    if (!subscription) {
      return next();
    }
    
    // Check if user has reached their search limit
    if (subscription.searchesUsed >= subscription.searchesLimit) {
      const planName = subscription.plan === 'free' ? 'Free' : 
                       subscription.plan === 'professional' ? 'Professional' : 'Team';
      return res.status(403).json({
        error: "Search limit reached",
        message: subscription.plan === 'free' 
          ? "You've used all 10 free searches. Upgrade to Professional for 200 searches/month!"
          : `You've used all ${subscription.searchesLimit} searches for this month.`,
        upgradeUrl: "/pricing",
        code: "LIMIT_REACHED",
        usage: {
          used: subscription.searchesUsed,
          limit: subscription.searchesLimit,
          plan: subscription.plan
        }
      });
    }
    
    next();
  } catch (error) {
    console.error("Check search limit error:", error);
    next();
  }
}
