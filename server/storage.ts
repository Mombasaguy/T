import { type User, type InsertUser, type Candidate, type InsertCandidate } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Candidate methods
  getAllCandidates(): Promise<Candidate[]>;
  getCandidate(id: string): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: string, data: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  updateCandidateStage(id: string, stage: string): Promise<Candidate | undefined>;
  deleteCandidate(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private candidates: Map<string, Candidate>;

  constructor() {
    this.users = new Map();
    this.candidates = new Map();
    this.seedCandidates();
  }

  private seedCandidates() {
    const sampleCandidates: InsertCandidate[] = [
      {
        name: "Sarah Chen",
        email: "sarah.chen@email.com",
        phone: "+1 (555) 123-4567",
        role: "Senior Frontend Developer",
        stage: "interview",
        notes: "Strong React experience, 5+ years",
        appliedDate: "2024-12-15",
        rating: "4",
      },
      {
        name: "Michael Torres",
        email: "m.torres@email.com",
        phone: "+1 (555) 234-5678",
        role: "Backend Engineer",
        stage: "screening",
        notes: "Python and Node.js expertise",
        appliedDate: "2024-12-18",
        rating: "5",
      },
      {
        name: "Emily Watson",
        email: "emily.w@email.com",
        role: "Product Designer",
        stage: "applied",
        notes: "Great portfolio, Figma expert",
        appliedDate: "2024-12-20",
        rating: "4",
      },
      {
        name: "James Kim",
        email: "james.kim@email.com",
        phone: "+1 (555) 345-6789",
        role: "Full Stack Developer",
        stage: "offer",
        notes: "Excellent technical interview",
        appliedDate: "2024-12-10",
        rating: "5",
      },
      {
        name: "Lisa Martinez",
        email: "lisa.m@email.com",
        role: "DevOps Engineer",
        stage: "interview",
        notes: "AWS and Kubernetes certified",
        appliedDate: "2024-12-12",
        rating: "4",
      },
      {
        name: "David Park",
        email: "david.park@email.com",
        phone: "+1 (555) 456-7890",
        role: "Data Scientist",
        stage: "screening",
        notes: "ML background, PhD candidate",
        appliedDate: "2024-12-19",
        rating: "5",
      },
      {
        name: "Amanda Foster",
        email: "a.foster@email.com",
        role: "UX Researcher",
        stage: "hired",
        notes: "Started on Jan 2nd",
        appliedDate: "2024-11-25",
        rating: "5",
      },
      {
        name: "Robert Johnson",
        email: "r.johnson@email.com",
        role: "Senior Backend Developer",
        stage: "applied",
        notes: "10+ years Java experience",
        appliedDate: "2024-12-21",
        rating: "3",
      },
    ];

    sampleCandidates.forEach((candidate) => {
      const id = randomUUID();
      const fullCandidate: Candidate = {
        id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone ?? null,
        role: candidate.role,
        stage: candidate.stage ?? "applied",
        avatarUrl: candidate.avatarUrl ?? null,
        notes: candidate.notes ?? null,
        appliedDate: candidate.appliedDate,
        rating: candidate.rating ?? null,
      };
      this.candidates.set(id, fullCandidate);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllCandidates(): Promise<Candidate[]> {
    return Array.from(this.candidates.values());
  }

  async getCandidate(id: string): Promise<Candidate | undefined> {
    return this.candidates.get(id);
  }

  async createCandidate(insertCandidate: InsertCandidate): Promise<Candidate> {
    const id = randomUUID();
    const candidate: Candidate = {
      id,
      name: insertCandidate.name,
      email: insertCandidate.email,
      phone: insertCandidate.phone ?? null,
      role: insertCandidate.role,
      stage: insertCandidate.stage ?? "applied",
      avatarUrl: insertCandidate.avatarUrl ?? null,
      notes: insertCandidate.notes ?? null,
      appliedDate: insertCandidate.appliedDate,
      rating: insertCandidate.rating ?? null,
    };
    this.candidates.set(id, candidate);
    return candidate;
  }

  async updateCandidate(id: string, data: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const existing = this.candidates.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.candidates.set(id, updated);
    return updated;
  }

  async updateCandidateStage(id: string, stage: string): Promise<Candidate | undefined> {
    const existing = this.candidates.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, stage };
    this.candidates.set(id, updated);
    return updated;
  }

  async deleteCandidate(id: string): Promise<boolean> {
    return this.candidates.delete(id);
  }
}

export const storage = new MemStorage();
