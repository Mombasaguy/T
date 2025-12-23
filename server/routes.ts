import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCandidateSchema, insertPositionSchema } from "@shared/schema";
import { z } from "zod";
import Exa from "exa-js";
import Anthropic from "@anthropic-ai/sdk";
import { stripeService } from "./stripeService";
import { getStripePublishableKey, getUncachableStripeClient } from "./stripeClient";
import { optionalAuth, checkSearchLimit, type AuthRequest } from "./auth";
import {
  handleCheckoutCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed
} from "./webhookHandlers";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Webhook endpoint - must be before express.json() in main app
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      try {
        const stripe = await getUncachableStripeClient();
        const sig = req.headers["stripe-signature"];
        
        if (!sig) {
          console.error("No signature in webhook");
          return res.status(400).send("No signature");
        }

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
          console.error("STRIPE_WEBHOOK_SECRET not configured");
          return res.status(500).send("Webhook secret missing");
        }

        const event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          webhookSecret
        );

        console.log(`Webhook received: ${event.type}`);

        switch (event.type) {
          case "checkout.session.completed":
            await handleCheckoutCompleted(event as any);
            break;
          
          case "customer.subscription.updated":
            await handleSubscriptionUpdated(event as any);
            break;
          
          case "customer.subscription.deleted":
            await handleSubscriptionDeleted(event as any);
            break;
          
          case "invoice.payment_succeeded":
            await handleInvoicePaymentSucceeded(event as any);
            break;
          
          case "invoice.payment_failed":
            await handleInvoicePaymentFailed(event as any);
            break;
          
          default:
            console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
      } catch (error: any) {
        console.error("Webhook error:", error.message);
        res.status(400).send(`Webhook Error: ${error.message}`);
      }
    }
  );

  // Get all candidates
  app.get("/api/candidates", async (_req, res) => {
    try {
      const candidates = await storage.getAllCandidates();
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch candidates" });
    }
  });

  // Get single candidate
  app.get("/api/candidates/:id", async (req, res) => {
    try {
      const candidate = await storage.getCandidate(req.params.id);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch candidate" });
    }
  });

  // Create candidate
  app.post("/api/candidates", async (req, res) => {
    try {
      const parsed = insertCandidateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const candidate = await storage.createCandidate(parsed.data);
      res.status(201).json(candidate);
    } catch (error) {
      res.status(500).json({ error: "Failed to create candidate" });
    }
  });

  // Update candidate
  app.patch("/api/candidates/:id", async (req, res) => {
    try {
      const parsed = insertCandidateSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const candidate = await storage.updateCandidate(req.params.id, parsed.data);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      res.status(500).json({ error: "Failed to update candidate" });
    }
  });

  // Update candidate stage
  app.patch("/api/candidates/:id/stage", async (req, res) => {
    try {
      const stageSchema = z.object({ stage: z.string() });
      const parsed = stageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const candidate = await storage.updateCandidateStage(req.params.id, parsed.data.stage);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      res.status(500).json({ error: "Failed to update candidate stage" });
    }
  });

  // Delete candidate
  app.delete("/api/candidates/:id", async (req, res) => {
    try {
      const success = await storage.deleteCandidate(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Candidate not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete candidate" });
    }
  });

  // Exa search endpoint with usage tracking
  app.post("/api/search", optionalAuth, checkSearchLimit, async (req: AuthRequest, res) => {
    try {
      const querySchema = z.object({ query: z.string().min(1) });
      const parsed = querySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Query is required" });
      }

      const apiKey = process.env.EXA_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "EXA_API_KEY not configured" });
      }

      const userQuery = parsed.data.query;
      const userId = req.userId || 'guest';

      const exa = new Exa(apiKey);
      const result = await exa.searchAndContents(userQuery, {
        type: "auto",
        category: "people" as any,
        useAutoprompt: true,
        numResults: 12,
        text: { maxCharacters: 1000 },
        highlights: { numSentences: 3, highlightsPerUrl: 3 },
      });

      const queryLower = userQuery.toLowerCase();
      const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2);

      const extractPlatform = (url: string): string => {
        try {
          const hostname = new URL(url).hostname.toLowerCase();
          if (hostname.includes("github.com")) return "GitHub";
          if (hostname.includes("twitter.com") || hostname.includes("x.com")) return "Twitter";
          if (hostname.includes("linkedin.com")) return "LinkedIn";
          if (hostname.includes("medium.com")) return "Medium";
          if (hostname.includes("dev.to")) return "Dev.to";
          if (hostname.includes("behance.net")) return "Behance";
          if (hostname.includes("dribbble.com")) return "Dribbble";
          if (hostname.includes("stackoverflow.com")) return "StackOverflow";
          if (hostname.includes("youtube.com")) return "YouTube";
          if (hostname.includes("reddit.com")) return "Reddit";
          if (hostname.includes("substack.com")) return "Substack";
          return "Blog";
        } catch {
          return "Unknown";
        }
      };

      const extractAuthorFromUrl = (url: string): string | null => {
        try {
          const urlObj = new URL(url);
          const hostname = urlObj.hostname.toLowerCase();
          const pathname = urlObj.pathname;
          
          if (hostname.includes("github.com")) {
            const match = pathname.match(/^\/([^\/]+)/);
            if (match && match[1] && !["orgs", "topics", "trending", "explore"].includes(match[1])) {
              return match[1];
            }
          }
          if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
            const match = pathname.match(/^\/([^\/]+)/);
            if (match && match[1] && !["home", "explore", "search", "i"].includes(match[1])) {
              return `@${match[1]}`;
            }
          }
          if (hostname.includes("medium.com")) {
            const match = pathname.match(/^\/@([^\/]+)/);
            if (match && match[1]) return match[1];
          }
          if (hostname.includes("substack.com")) {
            const subdomain = hostname.split(".")[0];
            if (subdomain && subdomain !== "www" && subdomain !== "substack") {
              return subdomain;
            }
          }
          if (hostname.includes("dev.to")) {
            const match = pathname.match(/^\/([^\/]+)/);
            if (match && match[1]) return match[1];
          }
          return null;
        } catch {
          return null;
        }
      };

      const extractAuthorFromTitle = (title: string): string | null => {
        if (!title) return null;
        const patterns = [
          /^([^|\-–—]+?)\s*[|\-–—]/,
          /[|\-–—]\s*([^|\-–—]+?)$/,
          /^([A-Z][a-z]+ [A-Z][a-z]+)/,
        ];
        for (const pattern of patterns) {
          const match = title.match(pattern);
          if (match && match[1]) {
            const name = match[1].trim();
            if (name.length > 2 && name.length < 40 && !name.includes("http")) {
              return name;
            }
          }
        }
        return null;
      };

      const pickAuthor = (r: any): string => {
        if (r.author && typeof r.author === "string" && r.author.trim()) {
          return r.author.trim();
        }
        const urlAuthor = extractAuthorFromUrl(String(r.url || ""));
        if (urlAuthor) return urlAuthor;
        const titleAuthor = extractAuthorFromTitle(String(r.title || ""));
        if (titleAuthor) return titleAuthor;
        return "Unknown";
      };

      const getMatchStatus = (title: string, text: string | null): "match" | "miss" | "unknown" => {
        if (!title && !text) return "unknown";
        const content = `${title} ${text || ""}`.toLowerCase();
        const hasMatch = queryTerms.some(term => content.includes(term));
        return hasMatch ? "match" : "miss";
      };

      const transformedResults = (result.results || []).map((r: any) => {
        const originalTitle = String(r.title || "");
        
        // Extract person name - prefer author, then parse from title
        const personName = r.author || 
          originalTitle.split("|")[0].split("-")[0].trim() ||
          pickAuthor(r);
        
        // Extract role/company from title parts
        const titleParts = originalTitle.split("|").map((s: string) => s.trim());
        const role = titleParts[1] || titleParts[0] !== personName ? titleParts[0] : "";

        return {
          id: String(r.url || ""),
          name: personName,
          role: role,
          title: originalTitle,
          subtitle: role || (r.highlights && r.highlights.length > 0 ? String(r.highlights[0]).slice(0, 100) : null),
          url: String(r.url || ""),
          publishedDate: r.publishedDate ? String(r.publishedDate) : new Date().toISOString(),
          author: r.author ? String(r.author) : personName,
          text: r.text ? String(r.text) : null,
          highlights: Array.isArray(r.highlights) ? r.highlights.map(String) : [],
          score: typeof r.score === "number" ? r.score : 0,
          matchStatus: getMatchStatus(originalTitle, r.text ? String(r.text) : null),
          platform: extractPlatform(String(r.url || "")),
        };
      });

      // Increment usage after successful search
      await storage.incrementSearchUsage(userId);

      // Get updated subscription info (with defaults for free tier)
      const subscription = await storage.getSubscription(userId);
      const usage = subscription 
        ? {
            searchesUsed: subscription.searchesUsed,
            searchesLimit: subscription.searchesLimit,
            plan: subscription.plan
          }
        : {
            searchesUsed: 1,
            searchesLimit: 10,
            plan: 'free'
          };

      res.json({ 
        results: transformedResults,
        usage
      });
    } catch (error) {
      console.error("Exa search error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // Find similar candidates by URL
  app.post("/api/find-similar", async (req, res) => {
    try {
      const querySchema = z.object({ query: z.string().min(1) });
      const parsed = querySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "URL is required" });
      }

      const apiKey = process.env.EXA_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "EXA_API_KEY not configured" });
      }

      const profileUrl = parsed.data.query;
      const exa = new Exa(apiKey);

      // First, fetch the source profile content
      let sourceProfile = { name: "Unknown", title: "Professional", url: profileUrl };
      try {
        const sourceResult = await exa.getContents([profileUrl], {
          text: { maxCharacters: 500 },
        });
        if (sourceResult.results && sourceResult.results.length > 0) {
          const source = sourceResult.results[0];
          const title = source.title || "";
          const titleParts = title.split("|").map((s: string) => s.trim());
          sourceProfile = {
            name: titleParts[0] || source.author || "Unknown",
            title: titleParts[1] || titleParts[0] || "Professional",
            url: profileUrl,
          };
        }
      } catch (e) {
        console.log("Could not fetch source profile, continuing with findSimilar");
      }

      // Use Exa's findSimilar to find similar profiles
      const result = await exa.findSimilarAndContents(profileUrl, {
        category: "people" as any,
        numResults: 12,
        text: { maxCharacters: 1000 },
        highlights: { numSentences: 3, highlightsPerUrl: 3 },
        excludeSourceDomain: false,
      });

      const extractPlatform = (url: string): string => {
        try {
          const hostname = new URL(url).hostname.toLowerCase();
          if (hostname.includes("github.com")) return "GitHub";
          if (hostname.includes("twitter.com") || hostname.includes("x.com")) return "Twitter";
          if (hostname.includes("linkedin.com")) return "LinkedIn";
          if (hostname.includes("medium.com")) return "Medium";
          if (hostname.includes("dev.to")) return "Dev.to";
          if (hostname.includes("substack.com")) return "Substack";
          return "Blog";
        } catch {
          return "Unknown";
        }
      };

      const transformedResults = (result.results || []).map((r: any) => {
        const originalTitle = String(r.title || "");
        const titleParts = originalTitle.split("|").map((s: string) => s.trim());
        const personName = r.author || titleParts[0] || "Unknown";
        const role = titleParts[1] || titleParts[0] !== personName ? titleParts[0] : "";

        return {
          id: String(r.url || ""),
          name: personName,
          role: role,
          title: originalTitle,
          subtitle: role || (r.highlights && r.highlights.length > 0 ? String(r.highlights[0]).slice(0, 100) : null),
          url: String(r.url || ""),
          publishedDate: r.publishedDate ? String(r.publishedDate) : new Date().toISOString(),
          author: r.author ? String(r.author) : personName,
          text: r.text ? String(r.text) : null,
          highlights: Array.isArray(r.highlights) ? r.highlights.map(String) : [],
          score: typeof r.score === "number" ? r.score : 0.8,
          matchStatus: "match" as const,
          platform: extractPlatform(String(r.url || "")),
        };
      });

      res.json({ results: transformedResults, sourceProfile });
    } catch (error) {
      console.error("Find similar error:", error);
      res.status(500).json({ error: "Find similar failed" });
    }
  });

  // Position routes
  app.get("/api/positions", async (_req, res) => {
    try {
      const positions = await storage.getAllPositions();
      res.json(positions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch positions" });
    }
  });

  app.get("/api/positions/:id", async (req, res) => {
    try {
      const position = await storage.getPosition(req.params.id);
      if (!position) {
        return res.status(404).json({ error: "Position not found" });
      }
      res.json(position);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch position" });
    }
  });

  app.post("/api/positions", async (req, res) => {
    try {
      const parsed = insertPositionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const position = await storage.createPosition(parsed.data);
      res.status(201).json(position);
    } catch (error) {
      res.status(500).json({ error: "Failed to create position" });
    }
  });

  app.patch("/api/positions/:id", async (req, res) => {
    try {
      const parsed = insertPositionSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const position = await storage.updatePosition(req.params.id, parsed.data);
      if (!position) {
        return res.status(404).json({ error: "Position not found" });
      }
      res.json(position);
    } catch (error) {
      res.status(500).json({ error: "Failed to update position" });
    }
  });

  app.delete("/api/positions/:id", async (req, res) => {
    try {
      const success = await storage.deletePosition(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Position not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete position" });
    }
  });

  app.get("/api/positions/:id/candidates", async (req, res) => {
    try {
      const candidates = await storage.getCandidatesByPosition(req.params.id);
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch candidates for position" });
    }
  });

  app.get("/api/positions/:id/summary", async (req, res) => {
    try {
      const position = await storage.getPosition(req.params.id);
      if (!position) {
        return res.status(404).json({ error: "Position not found" });
      }
      const candidates = await storage.getCandidatesByPosition(req.params.id);
      const summary = {
        total: candidates.length,
        applied: candidates.filter(c => c.stage === "applied").length || 0,
        screening: candidates.filter(c => c.stage === "screening").length || 0,
        interview: candidates.filter(c => c.stage === "interview").length || 0,
        offer: candidates.filter(c => c.stage === "offer").length || 0,
        hired: candidates.filter(c => c.stage === "hired").length || 0,
        rejected: candidates.filter(c => c.stage === "rejected").length || 0,
      };
      res.json({ position, summary });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch position summary" });
    }
  });

  // Generate outreach email using Anthropic (requires paid plan)
  app.post("/api/generate-email", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { candidate } = req.body;
      
      if (!candidate) {
        return res.status(400).json({ error: "Candidate data required" });
      }

      // Check if user has AI email feature (Professional or higher)
      const userId = req.userId || 'guest';
      const subscription = await storage.getSubscription(userId);
      
      if (!subscription || subscription.plan === 'free') {
        return res.status(403).json({
          error: "Feature not available",
          message: "AI email generation requires Professional plan or higher",
          upgradeUrl: "/pricing",
          code: "UPGRADE_REQUIRED"
        });
      }

      const anthropic = new Anthropic({
        apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
      });

      const highlightsText = candidate.highlights?.join(". ") || "";
      const profileText = candidate.text?.slice(0, 200) || "";

      const prompt = `Generate a personalized recruiting outreach email for this candidate:

Name: ${candidate.name || candidate.author || "Candidate"}
Role: ${candidate.title || candidate.role || "Professional"}
Recent Activity: ${highlightsText}
Profile: ${profileText}

The email should:
- Be concise (3-4 sentences)
- Reference their recent work
- Express interest in their skills
- Be professional but friendly
- End with a clear call-to-action

Do not include [brackets] or placeholders. Write a complete email ready to send.`;

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const textContent = message.content.find((c) => c.type === "text");
      const email = textContent ? textContent.text : "Unable to generate email.";

      // Track email generation
      await storage.incrementEmailGenerated(userId);

      res.json({ email });
    } catch (error) {
      console.error("Email generation error:", error);
      res.status(500).json({ error: "Failed to generate email" });
    }
  });

  // Get subscription info
  app.get("/api/subscription", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId || 'guest';
      const subscription = await storage.getSubscription(userId);
      
      if (!subscription) {
        return res.json({
          plan: 'free',
          status: 'active',
          searchesUsed: 0,
          searchesLimit: 10,
          emailsGenerated: 0
        });
      }
      
      res.json(subscription);
    } catch (error) {
      console.error("Subscription fetch error:", error);
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  // Stripe config endpoint
  app.get("/api/stripe/config", async (_req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Stripe config error:", error);
      res.status(500).json({ error: "Failed to get Stripe config" });
    }
  });

  // Create checkout session
  app.post("/api/stripe/create-checkout-session", async (req, res) => {
    try {
      const { priceId, email, plan, userId } = req.body;

      if (!priceId) {
        return res.status(400).json({ error: "Price ID is required" });
      }

      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || req.get('host')}`;
      
      const session = await stripeService.createCheckoutSession({
        priceId,
        customerEmail: email,
        successUrl: `${baseUrl}/welcome?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${baseUrl}/pricing`,
        trialDays: 14,
        metadata: { plan, userId: userId || 'guest' },
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Checkout session error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Create customer portal session
  app.post("/api/stripe/create-portal-session", async (req, res) => {
    try {
      const { customerId } = req.body;

      if (!customerId) {
        return res.status(400).json({ error: "Customer ID is required" });
      }

      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || req.get('host')}`;
      
      const session = await stripeService.createPortalSession(
        customerId,
        `${baseUrl}/settings`
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error("Portal session error:", error);
      res.status(500).json({ error: "Failed to create portal session" });
    }
  });

  // Get Stripe products with prices
  app.get("/api/stripe/products", async (_req, res) => {
    try {
      const products = await stripeService.listProductsWithPrices();
      res.json({ products });
    } catch (error) {
      console.error("Products fetch error:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get checkout session details (for welcome page)
  app.get("/api/stripe/checkout-session/:sessionId", async (req, res) => {
    try {
      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(req.params.sessionId, {
        expand: ['subscription', 'customer'],
      });
      
      res.json({
        customerId: session.customer,
        subscriptionId: session.subscription,
        customerEmail: session.customer_details?.email,
        status: session.status,
      });
    } catch (error) {
      console.error("Checkout session error:", error);
      res.status(500).json({ error: "Failed to retrieve checkout session" });
    }
  });

  return httpServer;
}
