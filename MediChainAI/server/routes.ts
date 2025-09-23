import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./localAuth";
import { analyzeHealthData, generateHealthInsights } from "./services/openai";
import multer from "multer";
import crypto from "crypto";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Validation schemas
const healthDataSchema = z.object({
  age: z.number().min(1).max(120).optional(),
  gender: z.string().optional(),
  bloodPressureSystolic: z.number().min(60).max(300).optional(),
  bloodPressureDiastolic: z.number().min(40).max(200).optional(),
  heartRate: z.number().min(30).max(250).optional(),
  weight: z.number().min(50).max(1000).optional(),
  cholesterol: z.number().min(100).max(500).optional(),
  bloodSugar: z.number().min(50).max(500).optional(),
  recordType: z.string(),
});

const dataConsentSchema = z.object({
  requestId: z.number(),
  consentedDataTypes: z.array(z.string()),
  permissions: z.object({
    viewOnly: z.boolean().default(true),
    anonymized: z.boolean().default(true),
    duration: z.string().default("30days"),
  }),
});

// Helper function to generate blockchain transaction ID (simulated)
function generateBlockchainTxId(): string {
  return "0x" + crypto.randomBytes(32).toString("hex");
}

// Helper function to create audit log
async function logActivity(userId: string, action: string, resourceType: string, details: any) {
  await storage.createAuditLog({
    userId,
    action,
    resourceType,
    resourceId: details.resourceId || null,
    details,
    blockchainTxId: generateBlockchainTxId(),
    ipAddress: details.ipAddress || null,
    userAgent: details.userAgent || null,
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Assuming a default dummy user for now if not authenticated
      if (!req.isAuthenticated()) {
        req.user = storage.getUser("replit-user-123"); // Assign our dummy user
        if (!req.user) {
          // Fallback if dummy user not found for some reason
          return res.status(401).json({ message: "Unauthorized - no dummy user" });
        }
      }
      const { password, ...safeUser } = req.user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Health Records endpoints
  app.post('/api/health-records', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = healthDataSchema.parse(req.body);
      
      // Generate blockchain hash (simulated)
      const dataHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(validatedData))
        .digest('hex');
      
      const blockchainTxId = generateBlockchainTxId();
      
      // Create health record
      const healthRecord = await storage.createHealthRecord({
        userId,
        recordType: validatedData.recordType,
        data: validatedData,
        dataHash,
        blockchainTxId,
        isEncrypted: true,
      });

      // Reward tokens for uploading data
      const rewardAmount = 75;
      await storage.updateUserTokenBalance(userId, rewardAmount);
      await storage.createTokenTransaction({
        userId,
        transactionType: 'earned',
        amount: rewardAmount,
        description: 'Health data upload reward',
        relatedId: healthRecord.id,
        blockchainTxId: generateBlockchainTxId(),
      });

      // Log activity
      await logActivity(userId, 'upload_health_data', 'health_record', {
        resourceId: healthRecord.id.toString(),
        recordType: validatedData.recordType,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({ 
        healthRecord, 
        rewardEarned: rewardAmount,
        message: 'Health data uploaded successfully' 
      });
    } catch (error) {
      console.error("Error uploading health data:", error);
      res.status(500).json({ message: "Failed to upload health data" });
    }
  });

  app.get('/api/health-records', async (req: any, res) => {
    try {
      const userId = (req.isAuthenticated() ? req.user.id : "replit-user-123"); // Use authenticated user or dummy
      const records = await storage.getUserHealthRecords(userId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching health records:", error);
      res.status(500).json({ message: "Failed to fetch health records" });
    }
  });

  // File upload endpoint
  app.post('/api/upload-file', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Process file based on type
      let processedData: any = {};
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

      if (fileExtension === 'json') {
        processedData = JSON.parse(file.buffer.toString());
      } else if (fileExtension === 'csv') {
        // Basic CSV parsing (you might want to use a proper CSV parser)
        const csvData = file.buffer.toString();
        processedData = { csvData, type: 'csv' };
      } else {
        processedData = { 
          fileName: file.originalname,
          fileSize: file.size,
          fileType: file.mimetype,
          type: 'file'
        };
      }

      const dataHash = crypto
        .createHash('sha256')
        .update(file.buffer)
        .digest('hex');

      const blockchainTxId = generateBlockchainTxId();

      const healthRecord = await storage.createHealthRecord({
        userId,
        recordType: 'file_upload',
        data: processedData,
        dataHash,
        blockchainTxId,
        isEncrypted: true,
      });

      // Reward tokens
      const rewardAmount = 100;
      await storage.updateUserTokenBalance(userId, rewardAmount);
      await storage.createTokenTransaction({
        userId,
        transactionType: 'earned',
        amount: rewardAmount,
        description: 'File upload reward',
        relatedId: healthRecord.id,
        blockchainTxId: generateBlockchainTxId(),
      });

      await logActivity(userId, 'upload_file', 'health_record', {
        resourceId: healthRecord.id.toString(),
        fileName: file.originalname,
        fileSize: file.size,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({ 
        healthRecord, 
        rewardEarned: rewardAmount,
        message: 'File uploaded successfully' 
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // AI Analysis endpoints
  app.post('/api/ai-analysis', async (req: any, res) => {
    try {
      const userId = (req.isAuthenticated() ? req.user.id : "replit-user-123"); // Use authenticated user or dummy
      
      // Get user's health records
      const healthRecords = await storage.getUserHealthRecords(userId);
      
      if (healthRecords.length === 0) {
        return res.status(400).json({ message: "No health data available for analysis" });
      }

      // Combine health data for analysis
      const combinedData = healthRecords.reduce((acc, record) => {
        const recordData = typeof record.data === 'object' && record.data !== null ? record.data : {};
        return { ...acc, ...recordData };
      }, {});

      // Run AI analysis
      const analysisResult = await analyzeHealthData(combinedData);

      // Save analysis results
      const aiAnalysis = await storage.createAiAnalysis({
        userId,
        healthRecordId: healthRecords[0].id,
        analysisType: 'comprehensive_health_assessment',
        analysisData: { // All analysis results nested here
          results: analysisResult, // The full analysis result object
          insights: analysisResult.insights,
          riskScore: analysisResult.cardiacRisk.toString(),
          recommendations: analysisResult.recommendations,
          modelVersion: 'gpt-4o',
        },
      });

      // Reward tokens for AI analysis
      const rewardAmount = 50;
      await storage.updateUserTokenBalance(userId, rewardAmount);
      await storage.createTokenTransaction({
        userId,
        transactionType: 'earned',
        amount: rewardAmount,
        description: 'AI analysis reward',
        relatedId: aiAnalysis.id,
        blockchainTxId: generateBlockchainTxId(),
      });

      await logActivity(userId, 'ai_analysis', 'ai_analysis', {
        resourceId: aiAnalysis.id.toString(),
        analysisType: 'comprehensive_health_assessment',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({ 
        analysis: aiAnalysis,
        rewardEarned: rewardAmount,
        message: 'AI analysis completed successfully' 
      });
    } catch (error) {
      console.error("Error running AI analysis:", error);
      res.status(500).json({ message: "Failed to run AI analysis" });
    }
  });

  app.get('/api/ai-analyses', async (req: any, res) => {
    try {
      const userId = (req.isAuthenticated() ? req.user.id : "replit-user-123"); // Use authenticated user or dummy
      const analyses = await storage.getUserAiAnalyses(userId);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching AI analyses:", error);
      res.status(500).json({ message: "Failed to fetch AI analyses" });
    }
  });

  // Data Requests endpoints
  app.get('/api/data-requests', async (req: any, res) => {
    try {
      // For now, always use the dummy user's requests
      const requests = await storage.getActiveDataRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching data requests:", error);
      res.status(500).json({ message: "Failed to fetch data requests" });
    }
  });

  // Data Consent endpoints
  app.post('/api/data-consent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = dataConsentSchema.parse(req.body);
      
      const dataRequest = await storage.getDataRequest(validatedData.requestId);
      if (!dataRequest) {
        return res.status(404).json({ message: "Data request not found" });
      }

      const blockchainTxId = generateBlockchainTxId();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

      const consent = await storage.createDataConsent({
        userId,
        requestId: validatedData.requestId,
        consentedDataTypes: validatedData.consentedDataTypes,
        permissions: validatedData.permissions,
        isAnonymized: validatedData.permissions.anonymized,
        rewardEarned: dataRequest.rewardAmount,
        blockchainTxId,
        expiresAt,
      });

      // Reward tokens for data sharing
      await storage.updateUserTokenBalance(userId, dataRequest.rewardAmount);
      await storage.createTokenTransaction({
        userId,
        transactionType: 'earned',
        amount: dataRequest.rewardAmount,
        description: `Data sharing reward - ${dataRequest.requesterName}`,
        relatedId: consent.id,
        blockchainTxId: generateBlockchainTxId(),
      });

      await logActivity(userId, 'share_data', 'data_consent', {
        resourceId: consent.id.toString(),
        requesterId: dataRequest.requesterId,
        requesterName: dataRequest.requesterName,
        rewardAmount: dataRequest.rewardAmount,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({ 
        consent,
        rewardEarned: dataRequest.rewardAmount,
        message: 'Data sharing consent granted successfully' 
      });
    } catch (error) {
      console.error("Error granting data consent:", error);
      res.status(500).json({ message: "Failed to grant data consent" });
    }
  });

  app.get('/api/data-consents', async (req: any, res) => {
    try {
      const userId = (req.isAuthenticated() ? req.user.id : "replit-user-123"); // Use authenticated user or dummy
      const consents = await storage.getUserDataConsents(userId);
      res.json(consents);
    } catch (error) {
      console.error("Error fetching data consents:", error);
      res.status(500).json({ message: "Failed to fetch data consents" });
    }
  });

  // Token and Wallet endpoints
  app.get('/api/wallet', async (req: any, res) => {
    try {
      const userId = (req.isAuthenticated() ? req.user.id : "replit-user-123"); // Use authenticated user or dummy
      const balance = await storage.getUserTokenBalance(userId);
      const transactions = await storage.getUserTokenTransactions(userId);
      
      res.json({
        balance,
        transactions,
        walletAddress: `0x${crypto.createHash('sha256').update(userId).digest('hex').substring(0, 40)}`,
      });
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      res.status(500).json({ message: "Failed to fetch wallet data" });
    }
  });

  app.post('/api/redeem-reward', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { rewardType, cost } = req.body;
      
      const currentBalance = await storage.getUserTokenBalance(userId);
      
      if (currentBalance < cost) {
        return res.status(400).json({ message: "Insufficient token balance" });
      }

      // Deduct tokens
      await storage.updateUserTokenBalance(userId, -cost);
      await storage.createTokenTransaction({
        userId,
        transactionType: 'spent',
        amount: -cost,
        description: `Redeemed ${rewardType}`,
        blockchainTxId: generateBlockchainTxId(),
      });

      await logActivity(userId, 'redeem_reward', 'token_transaction', {
        rewardType,
        cost,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({ 
        message: 'Reward redeemed successfully',
        newBalance: currentBalance - cost 
      });
    } catch (error) {
      console.error("Error redeeming reward:", error);
      res.status(500).json({ message: "Failed to redeem reward" });
    }
  });

  // Audit Logs endpoints
  app.get('/api/audit-logs', async (req: any, res) => {
    try {
      const userId = (req.isAuthenticated() ? req.user.id : "replit-user-123"); // Use authenticated user or dummy
      const logs = await storage.getUserAuditLogs(userId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Initialize demo data
  app.post('/api/init-demo-data', isAuthenticated, async (req: any, res) => {
    try {
      // Create sample data requests
      const sampleRequests = [
        {
          requesterId: 'stanford_medical',
          requesterName: 'Stanford Medical Research',
          requesterType: 'research',
          studyTitle: 'Cardiovascular Health Study',
          dataTypes: ['blood_pressure', 'age', 'gender', 'exercise_data'],
          rewardAmount: 250,
          description: 'Long-term study on cardiovascular health patterns and risk factors.',
          participantCount: 1247,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        {
          requesterId: 'healthtech_labs',
          requesterName: 'HealthTech Labs',
          requesterType: 'research',
          studyTitle: 'AI Model Training - Diabetes Prevention',
          dataTypes: ['blood_sugar', 'bmi', 'family_history'],
          rewardAmount: 180,
          description: 'Training AI models for early diabetes detection and prevention.',
          participantCount: 856,
          expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        },
      ];

      for (const request of sampleRequests) {
        await storage.createDataRequest(request);
      }

      res.json({ message: 'Demo data initialized successfully' });
    } catch (error) {
      console.error("Error initializing demo data:", error);
      res.status(500).json({ message: "Failed to initialize demo data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
