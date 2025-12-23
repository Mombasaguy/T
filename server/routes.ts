import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCandidateSchema } from "@shared/schema";
import { z } from "zod";
import Exa from "exa-js";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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

  // Exa search endpoint
  app.post("/api/search", async (req, res) => {
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

      const exa = new Exa(apiKey);
      const result = await exa.searchAndContents(userQuery, {
        type: "auto",
        category: "people" as any,
        useAutoprompt: true,
        numResults: 12,
        text: { maxCharacters: 500 },
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
        const personName = pickAuthor(r);
        const originalTitle = String(r.title || "");
        const subtitle = originalTitle !== personName ? originalTitle : 
          (r.highlights && r.highlights.length > 0 ? String(r.highlights[0]).slice(0, 100) : null);

        return {
          id: String(r.url || ""),
          name: personName,
          title: personName,
          subtitle: subtitle,
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

      res.json({ results: transformedResults });
    } catch (error) {
      console.error("Exa search error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  return httpServer;
}
