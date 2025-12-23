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
  const userId = req.headers["x-user-id"] as string || req.cookies?.userId || 'guest';
  req.userId = userId;
  next();
}

export async function checkSearchLimit(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId || 'guest';
    const subscription = await storage.getSubscription(userId);
    
    if (!subscription) {
      const guestSearches = parseInt(req.cookies?.guestSearches || '0');
      if (guestSearches >= 10) {
        return res.status(403).json({
          error: "Search limit reached",
          message: "You've used all 10 free searches. Sign up for more!",
          upgradeUrl: "/pricing",
          code: "LIMIT_REACHED"
        });
      }
      return next();
    }
    
    if (subscription.searchesUsed >= subscription.searchesLimit) {
      return res.status(403).json({
        error: "Search limit reached",
        message: `You've used all ${subscription.searchesLimit} searches for this month.`,
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
