# Overview

MedChain is a blockchain-secured AI medical record sharing platform that demonstrates how healthcare data can be safely stored, analyzed, and shared while rewarding users with crypto incentives. The application simulates a complete healthcare ecosystem where patients can upload health data, receive AI-powered insights, share data with researchers/doctors, and earn HealthTokens (HTK) for their participation. Built as a demo prototype, it showcases modern web technologies including React, TypeScript, PostgreSQL with Drizzle ORM, and OpenAI integration for health analysis.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client uses React with TypeScript in a single-page application (SPA) structure. The UI is built with shadcn/ui components providing a consistent design system with Radix UI primitives and Tailwind CSS for styling. The application follows a tab-based dashboard pattern with distinct sections for data upload, AI analysis, sharing management, wallet operations, and audit logs. State management is handled through TanStack Query for server state and React hooks for local state.

## Backend Architecture  
The server implements a RESTful API using Express.js with TypeScript. Authentication is handled through Replit's OIDC integration with session-based storage. The API follows a service layer pattern with dedicated modules for health data processing, AI analysis via OpenAI, and blockchain transaction simulation. File uploads are managed through multer middleware with memory storage.

## Database Design
PostgreSQL serves as the primary database with Drizzle ORM providing type-safe database operations. The schema includes tables for users, health records, AI analyses, data requests, consents, token transactions, audit logs, and sessions. Health data is stored with encryption flags and blockchain transaction references to simulate decentralized storage.

## AI Integration
OpenAI's GPT-4 model provides health data analysis capabilities. The system processes uploaded health metrics (blood pressure, heart rate, cholesterol, etc.) and generates comprehensive health insights including risk assessments, recommendations, and predictive scores. Analysis results are structured and stored for user review and sharing decisions.

## Security & Privacy Model
The application implements client-side encryption simulation for health data, consent-based sharing mechanisms, and comprehensive audit logging. All data sharing requires explicit user consent with configurable permissions (view-only, anonymized, duration-limited). Blockchain transaction IDs are generated to simulate immutable storage and provide transparency.

## Reward System
A token-based incentive system rewards users with HealthTokens (HTK) for data uploads, AI analyses, and data sharing activities. The wallet system tracks balances, transaction history, and provides redemption options for virtual rewards. This gamification encourages user participation while maintaining data privacy controls.

# External Dependencies

## Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL database for production deployment
- **Drizzle ORM**: Type-safe database toolkit and query builder

## Authentication
- **Replit Auth**: OIDC-based authentication system integrated with Replit's identity provider
- **Connect PG Simple**: PostgreSQL session store for Express sessions

## AI Services  
- **OpenAI API**: GPT-4 model for health data analysis and insight generation

## Frontend Libraries
- **React**: Component-based UI framework with TypeScript
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **shadcn/ui**: Component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Chart.js**: Data visualization for health trends and analytics

## Build Tools
- **Vite**: Fast build tool and development server
- **ESBuild**: JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration

## File Processing
- **Multer**: File upload middleware for Express
- **Crypto-js**: Client-side encryption utilities

## Development Tools
- **TypeScript**: Static type checking
- **Zod**: Runtime type validation for API schemas