import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (local authentication)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  email: varchar("email"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  tokenBalance: integer("token_balance").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Health Data Records
export const healthRecords = pgTable("health_records", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  recordType: varchar("record_type").notNull(), // 'vitals', 'lab_results', 'fitness', etc.
  data: jsonb("data").notNull(), // Encrypted health data
  dataHash: varchar("data_hash").notNull(), // Blockchain hash reference
  blockchainTxId: varchar("blockchain_tx_id"),
  isEncrypted: boolean("is_encrypted").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Analysis Results
export const aiAnalyses = pgTable("ai_analyses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  healthRecordId: integer("health_record_id").references(() => healthRecords.id),
  analysisType: varchar("analysis_type").notNull(), // 'risk_assessment', 'trend_analysis', etc.
  results: jsonb("results").notNull(), // AI analysis results
  insights: text("insights"),
  riskScore: decimal("risk_score", { precision: 5, scale: 2 }),
  recommendations: jsonb("recommendations"),
  modelVersion: varchar("model_version"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Data Sharing Requests
export const dataRequests = pgTable("data_requests", {
  id: serial("id").primaryKey(),
  requesterId: varchar("requester_id").notNull(), // Research organization ID
  requesterName: varchar("requester_name").notNull(),
  requesterType: varchar("requester_type").notNull(), // 'research', 'medical', etc.
  studyTitle: varchar("study_title").notNull(),
  dataTypes: jsonb("data_types").notNull(), // Array of requested data types
  rewardAmount: integer("reward_amount").notNull(), // HTK tokens offered
  description: text("description"),
  participantCount: integer("participant_count").default(0),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Data Sharing Consents
export const dataConsents = pgTable("data_consents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  requestId: integer("request_id").notNull().references(() => dataRequests.id),
  consentedDataTypes: jsonb("consented_data_types").notNull(),
  permissions: jsonb("permissions").notNull(), // Access permissions
  isAnonymized: boolean("is_anonymized").default(true),
  rewardEarned: integer("reward_earned").notNull(),
  blockchainTxId: varchar("blockchain_tx_id"),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Token Transactions
export const tokenTransactions = pgTable("token_transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  transactionType: varchar("transaction_type").notNull(), // 'earned', 'spent', 'reward'
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  relatedId: integer("related_id"), // Related record ID (consent, analysis, etc.)
  blockchainTxId: varchar("blockchain_tx_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: varchar("action").notNull(),
  resourceType: varchar("resource_type").notNull(),
  resourceId: varchar("resource_id"),
  details: jsonb("details"),
  blockchainTxId: varchar("blockchain_tx_id"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHealthRecordSchema = createInsertSchema(healthRecords).omit({
  id: true,
  createdAt: true,
});

export const insertAiAnalysisSchema = createInsertSchema(aiAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertDataRequestSchema = createInsertSchema(dataRequests).omit({
  id: true,
  createdAt: true,
});

export const insertDataConsentSchema = createInsertSchema(dataConsents).omit({
  id: true,
  createdAt: true,
});

export const insertTokenTransactionSchema = createInsertSchema(tokenTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type HealthRecord = typeof healthRecords.$inferSelect;
export type InsertHealthRecord = z.infer<typeof insertHealthRecordSchema>;
export type AiAnalysis = typeof aiAnalyses.$inferSelect;
export type InsertAiAnalysis = z.infer<typeof insertAiAnalysisSchema>;
export type DataRequest = typeof dataRequests.$inferSelect;
export type InsertDataRequest = z.infer<typeof insertDataRequestSchema>;
export type DataConsent = typeof dataConsents.$inferSelect;
export type InsertDataConsent = z.infer<typeof insertDataConsentSchema>;
export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type InsertTokenTransaction = z.infer<typeof insertTokenTransactionSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
