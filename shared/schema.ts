import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

// Position status
export const PositionStatus = {
  OPEN: "open",
  PAUSED: "paused",
  CLOSED: "closed",
} as const;

export type PositionStatusType = (typeof PositionStatus)[keyof typeof PositionStatus];

// Employment type
export const EmploymentType = {
  FULL_TIME: "full-time",
  PART_TIME: "part-time",
  CONTRACT: "contract",
  INTERN: "intern",
} as const;

export type EmploymentTypeValue = (typeof EmploymentType)[keyof typeof EmploymentType];

// Positions table
export const positions = pgTable("positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  department: text("department").notNull(),
  location: text("location").notNull(),
  employmentType: text("employment_type").notNull().default(EmploymentType.FULL_TIME),
  status: text("status").notNull().default(PositionStatus.OPEN),
  description: text("description"),
  openings: integer("openings").notNull().default(1),
});

export const insertPositionSchema = createInsertSchema(positions).omit({
  id: true,
});

export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Position = typeof positions.$inferSelect;

export const positionFormSchema = insertPositionSchema.extend({
  title: z.string().min(2, "Title must be at least 2 characters"),
  department: z.string().min(2, "Department is required"),
  location: z.string().min(2, "Location is required"),
  employmentType: z.string().optional(),
  status: z.string().optional(),
  description: z.string().optional(),
  openings: z.number().min(1).optional(),
});

export type PositionFormData = z.infer<typeof positionFormSchema>;

// Candidate stages for the hiring pipeline
export const CandidateStage = {
  APPLIED: "applied",
  SCREENING: "screening",
  INTERVIEW: "interview",
  OFFER: "offer",
  HIRED: "hired",
  REJECTED: "rejected",
} as const;

export type CandidateStageType = (typeof CandidateStage)[keyof typeof CandidateStage];

export const candidateStages: CandidateStageType[] = [
  CandidateStage.APPLIED,
  CandidateStage.SCREENING,
  CandidateStage.INTERVIEW,
  CandidateStage.OFFER,
  CandidateStage.HIRED,
  CandidateStage.REJECTED,
];

// Candidates table
export const candidates = pgTable("candidates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: text("role").notNull(),
  stage: text("stage").notNull().default(CandidateStage.APPLIED),
  avatarUrl: text("avatar_url"),
  notes: text("notes"),
  appliedDate: text("applied_date").notNull(),
  rating: text("rating"),
  positionId: text("position_id"),
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
}).extend({
  positionId: z.string().nullable().optional(),
});

export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidates.$inferSelect;

// Candidate form schema with validation
export const candidateFormSchema = insertCandidateSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  phone: z.string().optional(),
  notes: z.string().optional(),
  rating: z.string().optional(),
  positionId: z.string().optional().nullable(),
});

export type CandidateFormData = z.infer<typeof candidateFormSchema>;

// ═══════════════════════════════════════════════════════
// SUBSCRIPTIONS TABLE
// ═══════════════════════════════════════════════════════

export const SubscriptionPlan = {
  FREE: "free",
  PROFESSIONAL: "professional",
  TEAM: "team",
  ENTERPRISE: "enterprise",
} as const;

export type SubscriptionPlanType = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

export const SubscriptionStatus = {
  ACTIVE: "active",
  TRIALING: "trialing",
  PAST_DUE: "past_due",
  CANCELED: "canceled",
  INCOMPLETE: "incomplete",
} as const;

export type SubscriptionStatusType = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().unique(),
  
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  
  plan: text("plan").notNull().default(SubscriptionPlan.FREE),
  status: text("status").notNull().default(SubscriptionStatus.ACTIVE),
  
  searchesUsed: integer("searches_used").notNull().default(0),
  searchesLimit: integer("searches_limit").notNull().default(10),
  emailsGenerated: integer("emails_generated").notNull().default(0),
  
  currentPeriodStart: text("current_period_start"),
  currentPeriodEnd: text("current_period_end"),
  trialEnd: text("trial_end"),
  
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export function getSearchLimitForPlan(plan: SubscriptionPlanType): number {
  switch (plan) {
    case SubscriptionPlan.FREE:
      return 10;
    case SubscriptionPlan.PROFESSIONAL:
      return 200;
    case SubscriptionPlan.TEAM:
      return 1000;
    case SubscriptionPlan.ENTERPRISE:
      return 999999;
    default:
      return 10;
  }
}
