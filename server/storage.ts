import { type User, type InsertUser, type Candidate, type InsertCandidate, type Position, type InsertPosition, type Subscription, type InsertSubscription, getSearchLimitForPlan, SubscriptionPlan } from "@shared/schema";
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
  getCandidatesByPosition(positionId: string): Promise<Candidate[]>;
  
  // Position methods
  getAllPositions(): Promise<Position[]>;
  getPosition(id: string): Promise<Position | undefined>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(id: string, data: Partial<InsertPosition>): Promise<Position | undefined>;
  deletePosition(id: string): Promise<boolean>;
  
  // Subscription methods
  getSubscription(userId: string): Promise<Subscription | null>;
  getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null>;
  createSubscription(data: InsertSubscription): Promise<Subscription>;
  updateSubscription(userId: string, data: Partial<InsertSubscription>): Promise<Subscription | null>;
  incrementSearchUsage(userId: string): Promise<void>;
  resetMonthlyUsage(userId: string): Promise<void>;
  incrementEmailGenerated(userId: string): Promise<void>;
  upgradeSubscription(userId: string, plan: string, stripeSubscriptionId: string, stripePriceId: string, currentPeriodEnd: string): Promise<Subscription | null>;
  cancelSubscription(userId: string): Promise<Subscription | null>;
  
  // Demo data methods
  isDemoDataLoaded(): boolean;
  loadDemoData(): void;
  clearAllData(): void;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private candidates: Map<string, Candidate>;
  private positions: Map<string, Position>;
  private subscriptions: Map<string, Subscription>;

  private demoDataLoaded: boolean = false;

  constructor() {
    this.users = new Map();
    this.candidates = new Map();
    this.positions = new Map();
    this.subscriptions = new Map();
  }

  isDemoDataLoaded(): boolean {
    return this.demoDataLoaded;
  }

  loadDemoData(): void {
    if (this.demoDataLoaded) return;
    this.seedPositions();
    this.seedCandidates();
    this.demoDataLoaded = true;
  }

  clearAllData(): void {
    this.candidates.clear();
    this.positions.clear();
    this.demoDataLoaded = false;
  }

  private seedPositions() {
    const samplePositions: InsertPosition[] = [
      {
        title: "Senior Frontend Developer",
        department: "Engineering",
        location: "San Francisco, CA",
        employmentType: "full-time",
        status: "open",
        description: "Build beautiful user interfaces with React and TypeScript",
        openings: 2,
      },
      {
        title: "Backend Engineer",
        department: "Engineering",
        location: "Remote",
        employmentType: "full-time",
        status: "open",
        description: "Design and build scalable APIs and services",
        openings: 3,
      },
      {
        title: "Product Designer",
        department: "Design",
        location: "New York, NY",
        employmentType: "full-time",
        status: "open",
        description: "Create intuitive user experiences and design systems",
        openings: 1,
      },
      {
        title: "DevOps Engineer",
        department: "Engineering",
        location: "Remote",
        employmentType: "full-time",
        status: "paused",
        description: "Manage cloud infrastructure and CI/CD pipelines",
        openings: 1,
      },
    ];

    samplePositions.forEach((position) => {
      const id = randomUUID();
      const fullPosition: Position = {
        id,
        title: position.title,
        department: position.department,
        location: position.location,
        employmentType: position.employmentType ?? "full-time",
        status: position.status ?? "open",
        description: position.description ?? null,
        openings: position.openings ?? 1,
      };
      this.positions.set(id, fullPosition);
    });
  }

  private seedCandidates() {
    const positionIds = Array.from(this.positions.keys());
    
    const sampleCandidates: (InsertCandidate & { positionIndex?: number })[] = [
      {
        name: "Sarah Chen",
        email: "sarah.chen@email.com",
        phone: "+1 (555) 123-4567",
        role: "Senior Frontend Developer",
        stage: "interview",
        notes: "Strong React experience, 5+ years",
        appliedDate: "2024-12-15",
        rating: "4",
        positionIndex: 0,
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
        positionIndex: 1,
      },
      {
        name: "Emily Watson",
        email: "emily.w@email.com",
        role: "Product Designer",
        stage: "applied",
        notes: "Great portfolio, Figma expert",
        appliedDate: "2024-12-20",
        rating: "4",
        positionIndex: 2,
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
        positionIndex: 0,
      },
      {
        name: "Lisa Martinez",
        email: "lisa.m@email.com",
        role: "DevOps Engineer",
        stage: "interview",
        notes: "AWS and Kubernetes certified",
        appliedDate: "2024-12-12",
        rating: "4",
        positionIndex: 3,
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
        positionIndex: 2,
      },
      {
        name: "Robert Johnson",
        email: "r.johnson@email.com",
        role: "Senior Backend Developer",
        stage: "applied",
        notes: "10+ years Java experience",
        appliedDate: "2024-12-21",
        rating: "3",
        positionIndex: 1,
      },
    ];

    sampleCandidates.forEach((candidate) => {
      const id = randomUUID();
      const positionId = candidate.positionIndex !== undefined ? positionIds[candidate.positionIndex] : null;
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
        positionId: positionId,
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
      positionId: insertCandidate.positionId ?? null,
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

  async getCandidatesByPosition(positionId: string): Promise<Candidate[]> {
    return Array.from(this.candidates.values()).filter(c => c.positionId === positionId);
  }

  // Position methods
  async getAllPositions(): Promise<Position[]> {
    return Array.from(this.positions.values());
  }

  async getPosition(id: string): Promise<Position | undefined> {
    return this.positions.get(id);
  }

  async createPosition(insertPosition: InsertPosition): Promise<Position> {
    const id = randomUUID();
    const position: Position = {
      id,
      title: insertPosition.title,
      department: insertPosition.department,
      location: insertPosition.location,
      employmentType: insertPosition.employmentType ?? "full-time",
      status: insertPosition.status ?? "open",
      description: insertPosition.description ?? null,
      openings: insertPosition.openings ?? 1,
    };
    this.positions.set(id, position);
    return position;
  }

  async updatePosition(id: string, data: Partial<InsertPosition>): Promise<Position | undefined> {
    const existing = this.positions.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.positions.set(id, updated);
    return updated;
  }

  async deletePosition(id: string): Promise<boolean> {
    // Remove position reference from candidates
    Array.from(this.candidates.entries()).forEach(([candidateId, candidate]) => {
      if (candidate.positionId === id) {
        this.candidates.set(candidateId, { ...candidate, positionId: null });
      }
    });
    return this.positions.delete(id);
  }

  // Subscription methods
  async getSubscription(userId: string): Promise<Subscription | null> {
    return Array.from(this.subscriptions.values()).find(s => s.userId === userId) || null;
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
    return Array.from(this.subscriptions.values()).find(s => s.stripeSubscriptionId === stripeSubscriptionId) || null;
  }

  async createSubscription(data: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const subscription: Subscription = {
      id,
      userId: data.userId,
      stripeCustomerId: data.stripeCustomerId ?? null,
      stripeSubscriptionId: data.stripeSubscriptionId ?? null,
      stripePriceId: data.stripePriceId ?? null,
      plan: data.plan ?? SubscriptionPlan.FREE,
      status: data.status ?? "active",
      searchesUsed: data.searchesUsed ?? 0,
      searchesLimit: data.searchesLimit ?? 10,
      emailsGenerated: data.emailsGenerated ?? 0,
      currentPeriodStart: data.currentPeriodStart ?? null,
      currentPeriodEnd: data.currentPeriodEnd ?? null,
      trialEnd: data.trialEnd ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(userId: string, data: Partial<InsertSubscription>): Promise<Subscription | null> {
    const existing = Array.from(this.subscriptions.values()).find(s => s.userId === userId);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    this.subscriptions.set(existing.id, updated);
    return updated;
  }

  async incrementSearchUsage(userId: string): Promise<void> {
    const existing = Array.from(this.subscriptions.values()).find(s => s.userId === userId);
    if (existing) {
      const updated = { ...existing, searchesUsed: existing.searchesUsed + 1, updatedAt: new Date().toISOString() };
      this.subscriptions.set(existing.id, updated);
    } else {
      // Create a free subscription with 1 search used for new users
      await this.createSubscription({
        userId,
        plan: SubscriptionPlan.FREE,
        status: "active",
        searchesUsed: 1,
        searchesLimit: 10,
        emailsGenerated: 0,
      });
    }
  }

  async resetMonthlyUsage(userId: string): Promise<void> {
    const existing = Array.from(this.subscriptions.values()).find(s => s.userId === userId);
    if (existing) {
      const updated = { ...existing, searchesUsed: 0, updatedAt: new Date().toISOString() };
      this.subscriptions.set(existing.id, updated);
    }
  }

  async incrementEmailGenerated(userId: string): Promise<void> {
    const existing = Array.from(this.subscriptions.values()).find(s => s.userId === userId);
    if (existing) {
      const updated = { ...existing, emailsGenerated: existing.emailsGenerated + 1, updatedAt: new Date().toISOString() };
      this.subscriptions.set(existing.id, updated);
    }
  }

  async upgradeSubscription(
    userId: string,
    plan: string,
    stripeSubscriptionId: string,
    stripePriceId: string,
    currentPeriodEnd: string
  ): Promise<Subscription | null> {
    const existing = Array.from(this.subscriptions.values()).find(s => s.userId === userId);
    if (!existing) return null;
    
    const searchesLimit = getSearchLimitForPlan(plan as any);
    const updated: Subscription = {
      ...existing,
      plan,
      status: "active",
      stripeSubscriptionId,
      stripePriceId,
      searchesLimit,
      searchesUsed: 0,
      currentPeriodEnd,
      updatedAt: new Date().toISOString(),
    };
    this.subscriptions.set(existing.id, updated);
    return updated;
  }

  async cancelSubscription(userId: string): Promise<Subscription | null> {
    const existing = Array.from(this.subscriptions.values()).find(s => s.userId === userId);
    if (!existing) return null;
    
    const updated: Subscription = {
      ...existing,
      plan: SubscriptionPlan.FREE,
      status: "canceled",
      searchesLimit: 10,
      stripeSubscriptionId: null,
      stripePriceId: null,
      updatedAt: new Date().toISOString(),
    };
    this.subscriptions.set(existing.id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
