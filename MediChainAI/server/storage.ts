import {
  users,
  healthRecords,
  aiAnalyses,
  dataRequests,
  dataConsents,
  tokenTransactions,
  auditLogs,
  type User,
  type UpsertUser,
  type HealthRecord,
  type InsertHealthRecord,
  type AiAnalysis,
  type InsertAiAnalysis,
  type DataRequest,
  type InsertDataRequest,
  type DataConsent,
  type InsertDataConsent,
  type TokenTransaction,
  type InsertTokenTransaction,
  type AuditLog,
  type InsertAuditLog,
} from "@shared/schema";
// import { db } from "./db"; // Removed
// import { eq, desc, and, sql } from "drizzle-orm"; // Removed

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserTokenBalance(userId: string, amount: number): Promise<void>;

  // Health Records
  createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord>;
  getUserHealthRecords(userId: string): Promise<HealthRecord[]>;
  getHealthRecord(id: number): Promise<HealthRecord | undefined>;

  // AI Analyses
  createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis>;
  getUserAiAnalyses(userId: string): Promise<AiAnalysis[]>;
  getLatestAiAnalysis(userId: string): Promise<AiAnalysis | undefined>;

  // Data Requests
  createDataRequest(request: InsertDataRequest): Promise<DataRequest>;
  getActiveDataRequests(): Promise<DataRequest[]>;
  getDataRequest(id: number): Promise<DataRequest | undefined>;

  // Data Consents
  createDataConsent(consent: InsertDataConsent): Promise<DataConsent>;
  getUserDataConsents(userId: string): Promise<DataConsent[]>;
  getActiveDataConsents(userId: string): Promise<DataConsent[]>;

  // Token Transactions
  createTokenTransaction(transaction: InsertTokenTransaction): Promise<TokenTransaction>;
  getUserTokenTransactions(userId: string): Promise<TokenTransaction[]>;
  getUserTokenBalance(userId: string): Promise<number>;

  // Audit Logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getUserAuditLogs(userId: string): Promise<AuditLog[]>;
}

// Mock implementation of IStorage as there is no database
export class MockStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private healthRecords: HealthRecord[] = [];
  private aiAnalyses: AiAnalysis[] = [];
  private tokenTransactions: TokenTransaction[] = [];
  private dataRequests: DataRequest[] = [];
  private dataConsents: DataConsent[] = [];
  private auditLogs: AuditLog[] = [];

  constructor() {
    this.initializeDummyData();
  }

  private initializeDummyData() {
    const dummyUserId = "replit-user-123";
    const now = new Date();

    const dummyUser: User = {
      id: dummyUserId,
      email: "user@example.com",
      firstName: "John",
      lastName: "Doe",
      profileImageUrl: "https://avatar.replit.com/username",
      tokenBalance: 500,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(dummyUser.id, dummyUser);

    // Dummy Health Records
    for (let i = 0; i < 15; i++) {
      const recordDate = new Date(now.getTime() - (15 - i) * 5 * 24 * 60 * 60 * 1000); // More frequent records
      this.healthRecords.push({
        id: i + 1,
        userId: dummyUserId,
        createdAt: recordDate,
        updatedAt: recordDate,
        recordData: {
          bloodPressureSystolic: 100 + (i * 3) % 30, // Varies between 100 and 127
          heartRate: 60 + (i * 2) % 20, // Varies between 60 and 78
          weight: 140 + (i * 1.5) % 15, // Varies between 140 and 153
          temperature: 98.0 + (i * 0.1) % 1.0,
          steps: 5000 + i * 1000,
        },
      });
    }

    // Dummy AI Analyses
    this.aiAnalyses.push(
      {
        id: 1,
        userId: dummyUserId,
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        analysisData: {
          overallHealthScore: 75,
          cardiacRisk: 40,
          fitnessLevel: 70,
          insights: [
            { type: "positive", title: "Good Sleep Habits", description: "Consistent sleep schedule observed." },
            { type: "warning", title: "Moderate Stress Levels", description: "Consider stress reduction techniques." },
            { type: "info", title: "Hydration Levels", description: "Maintain adequate water intake." },
          ],
          predictiveScore: 80,
          recommendations: [
            "Increase daily water intake",
            "Incorporate 30 minutes of moderate exercise daily",
            "Monitor blood pressure weekly",
          ],
        },
      },
      {
        id: 2,
        userId: dummyUserId,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        analysisData: {
          overallHealthScore: 88,
          cardiacRisk: 25,
          fitnessLevel: 90,
          insights: [
            { type: "positive", title: "Excellent Cardiovascular Health", description: "Consistent exercise and balanced diet." },
            { type: "info", title: "Vitamin D Intake", description: "Consider a supplement or more sun exposure." },
          ],
          predictiveScore: 92,
          recommendations: [
            "Continue current exercise regimen",
            "Explore new healthy recipes",
            "Regular check-ups recommended",
          ],
        },
      },
    );

    // Dummy Token Transactions
    this.tokenTransactions.push(
      {
        id: 1,
        userId: dummyUserId,
        amount: 50,
        type: "earned",
        description: "Health data upload",
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        entityId: "healthRecord1",
        entityType: "HealthRecord",
        status: "completed",
        blockchainTxId: "0xabc123def456",
      },
      {
        id: 2,
        userId: dummyUserId,
        amount: 20,
        type: "earned",
        description: "AI analysis reward",
        createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        entityId: "aiAnalysis1",
        entityType: "AiAnalysis",
        status: "completed",
        blockchainTxId: "0xdef789abc012",
      },
      {
        id: 3,
        userId: dummyUserId,
        amount: -100,
        type: "redeemed",
        description: "Premium AI analysis redemption",
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        entityId: "premiumAnalysis",
        entityType: "Reward",
        status: "completed",
        blockchainTxId: "0x123abc456def",
      },
      {
        id: 4,
        userId: dummyUserId,
        amount: 30,
        type: "earned",
        description: "Data sharing with researcher X",
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        entityId: "dataRequest1",
        entityType: "DataRequest",
        status: "completed",
        blockchainTxId: "0x456def789abc",
      },
      {
        id: 5,
        userId: dummyUserId,
        amount: 10,
        type: "earned",
        description: "Daily active bonus",
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        entityId: "dailyBonus",
        entityType: "System",
        status: "completed",
        blockchainTxId: "0x789abc012def",
      },
    );

    // Dummy Data Requests
    this.dataRequests.push(
      {
        id: 1,
        userId: dummyUserId,
        purpose: "Cardiovascular health study",
        isActive: true,
        dataTypes: ["blood_pressure", "heart_rate", "weight"], // Added dataTypes
        rewardAmount: 250, // Added rewardAmount for consistency
        requesterName: "Stanford Medical Research", // Added requesterName
        createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        id: 2,
        userId: dummyUserId,
        purpose: "Diabetes research",
        isActive: false,
        dataTypes: ["blood_sugar", "weight"], // Added dataTypes
        rewardAmount: 180, // Added rewardAmount for consistency
        requesterName: "HealthTech Labs", // Added requesterName
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      },
    );

    // Dummy Data Consents
    this.dataConsents.push(
      {
        id: 1,
        userId: dummyUserId,
        requestId: 1,
        status: "granted",
        isActive: true,
        consentedDataTypes: ["blood_pressure", "heart_rate"], // Added consentedDataTypes
        rewardEarned: 250, // Added rewardEarned for consistency
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // Example expiration
        blockchainTxId: "0xc0ffee112233", // Example blockchainTxId
        createdAt: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
      },
      {
        id: 2,
        userId: dummyUserId,
        requestId: 2,
        status: "denied",
        isActive: false,
        consentedDataTypes: [], // Added consentedDataTypes
        rewardEarned: 0, // No reward if denied
        expiresAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // Example expiration
        blockchainTxId: "0xdeadbeef4455", // Example blockchainTxId
        createdAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000),
      },
    );

    // Dummy Audit Logs
    this.auditLogs.push(
      {
        id: 1,
        userId: dummyUserId,
        action: "User login",
        details: { ipAddress: "192.168.1.1", device: "Chrome on Mac" },
        createdAt: new Date(now.getTime() - 0.1 * 24 * 60 * 60 * 1000),
      },
      {
        id: 2,
        userId: dummyUserId,
        action: "Health record uploaded",
        details: { recordId: 10, fileName: "blood_test_2025.pdf" },
        createdAt: new Date(now.getTime() - 0.5 * 24 * 60 * 60 * 1000),
      },
      {
        id: 3,
        userId: dummyUserId,
        action: "AI analysis requested",
        details: { analysisId: 2, model: "gpt-4" },
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    );
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    let user = this.users.get(userData.id);
    if (user) {
      user = { ...user, ...userData, updatedAt: new Date() };
    } else {
      user = {
        id: userData.id,
        email: userData.email || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        profileImageUrl: userData.profileImageUrl || '',
        tokenBalance: 0, // Default token balance
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    this.users.set(user.id, user);
    return user;
  }

  async updateUserTokenBalance(userId: string, amount: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.tokenBalance += amount;
      user.updatedAt = new Date();
    }
  }

  async createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord> {
    const newRecord: HealthRecord = {
      id: this.healthRecords.length + 1,
      userId: record.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      recordData: record.recordData,
    };
    this.healthRecords.push(newRecord);
    return newRecord;
  }

  async getUserHealthRecords(userId: string): Promise<HealthRecord[]> {
    return this.healthRecords.filter(record => record.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getHealthRecord(id: number): Promise<HealthRecord | undefined> {
    return this.healthRecords.find(record => record.id === id);
  }

  async createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis> {
    const newAnalysis: AiAnalysis = {
      id: this.aiAnalyses.length + 1,
      userId: analysis.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      analysisData: analysis.analysisData,
    };
    this.aiAnalyses.push(newAnalysis);
    return newAnalysis;
  }

  async getUserAiAnalyses(userId: string): Promise<AiAnalysis[]> {
    return this.aiAnalyses.filter(analysis => analysis.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getLatestAiAnalysis(userId: string): Promise<AiAnalysis | undefined> {
    const userAnalyses = this.aiAnalyses.filter(analysis => analysis.userId === userId);
    if (userAnalyses.length === 0) return undefined;
    return userAnalyses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  }

  async createDataRequest(request: InsertDataRequest): Promise<DataRequest> {
    const newDataRequest: DataRequest = {
      id: this.dataRequests.length + 1,
      userId: request.userId,
      purpose: request.purpose,
      isActive: request.isActive,
      dataTypes: request.dataTypes, // Ensure dataTypes is assigned
      rewardAmount: request.rewardAmount, // Ensure rewardAmount is assigned
      requesterName: request.requesterName, // Ensure requesterName is assigned
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.dataRequests.push(newDataRequest);
    return newDataRequest;
  }

  async getActiveDataRequests(): Promise<DataRequest[]> {
    return this.dataRequests.filter(request => request.isActive);
  }

  async getDataRequest(id: number): Promise<DataRequest | undefined> {
    return this.dataRequests.find(request => request.id === id);
  }

  async createDataConsent(consent: InsertDataConsent): Promise<DataConsent> {
    const newDataConsent: DataConsent = {
      id: this.dataConsents.length + 1,
      userId: consent.userId,
      requestId: consent.requestId,
      status: consent.status,
      isActive: consent.isActive,
      consentedDataTypes: consent.consentedDataTypes, // Ensure consentedDataTypes is assigned
      rewardEarned: consent.rewardEarned, // Ensure rewardEarned is assigned
      expiresAt: consent.expiresAt, // Ensure expiresAt is assigned
      blockchainTxId: consent.blockchainTxId, // Ensure blockchainTxId is assigned
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.dataConsents.push(newDataConsent);
    return newDataConsent;
  }

  async getUserDataConsents(userId: string): Promise<DataConsent[]> {
    return this.dataConsents.filter(consent => consent.userId === userId);
  }

  async getActiveDataConsents(userId: string): Promise<DataConsent[]> {
    return this.dataConsents.filter(consent => consent.userId === userId && consent.isActive);
  }

  async createTokenTransaction(transaction: InsertTokenTransaction): Promise<TokenTransaction> {
    const newTransaction: TokenTransaction = {
      id: this.tokenTransactions.length + 1,
      userId: transaction.userId,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      entityId: transaction.entityId,
      entityType: transaction.entityType,
      status: transaction.status,
      blockchainTxId: transaction.blockchainTxId,
    };
    this.tokenTransactions.push(newTransaction);
    return newTransaction;
  }

  async getUserTokenTransactions(userId: string): Promise<TokenTransaction[]> {
    return this.tokenTransactions.filter(transaction => transaction.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUserTokenBalance(userId: string): Promise<number> {
    const user = this.users.get(userId);
    return user?.tokenBalance || 0;
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const newAuditLog: AuditLog = {
      id: this.auditLogs.length + 1,
      userId: log.userId,
      action: log.action,
      details: log.details,
      createdAt: new Date(),
    };
    this.auditLogs.push(newAuditLog);
    return newAuditLog;
  }

  async getUserAuditLogs(userId: string): Promise<AuditLog[]> {
    return this.auditLogs.filter(log => log.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MockStorage();
