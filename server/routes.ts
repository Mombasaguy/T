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

      const exa = new Exa(apiKey);
      const result = await exa.searchAndContents(parsed.data.query, {
        type: "neural",
        numResults: 10,
        text: { maxCharacters: 500 },
        highlights: { numSentences: 2 },
      });

      const sanitizedResults = (result.results || []).map((r: any) => ({
        title: String(r.title || ""),
        url: String(r.url || ""),
        publishedDate: r.publishedDate ? String(r.publishedDate) : null,
        author: r.author ? String(r.author) : null,
        text: r.text ? String(r.text) : null,
        highlights: Array.isArray(r.highlights) ? r.highlights.map(String) : [],
      }));

      res.json({
        query: parsed.data.query,
        results: sanitizedResults,
      });
    } catch (error) {
      console.error("Exa search error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  return httpServer;
}
