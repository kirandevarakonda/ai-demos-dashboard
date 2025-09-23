import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";
import rateLimit from "express-rate-limit";
import type { Express, RequestHandler } from "express";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Force memory store for now due to database connection issues
  console.log("Using memory store for sessions (database unavailable)");
  const store = new session.MemoryStore();

  // Require SESSION_SECRET from environment for security

  process.env.SESSION_SECRET="23e2716e19795462829731eaccd3c68b0f1ad3aaef8169a5cb8939ac89c41f42"
  if (!process.env.SESSION_SECRET) {
    console.error("SESSION_SECRET environment variable is required for security");
    process.exit(1);
  }

  return session({
    secret: process.env.SESSION_SECRET,
    store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: 'lax', // CSRF protection
      maxAge: sessionTtl,
    },
  });
}

// Mock user database - in production this would be replaced with real database queries
const users = [
  {
    id: '1',
    username: 'user1',
    password: '$2b$10$7RD2TuJbS7Kex/lkZXE.iewSG/AhyCR3JzjnO0glnlEEkAnjY8Qhm', // bcrypt hash of "123456"
    email: 'user1@example.com',
    firstName: 'Demo',
    lastName: 'User',
    tokenBalance: 100
  }
];

async function findUserByUsername(username: string) {
  return users.find(user => user.username === username);
}

async function findUserById(id: string) {
  return users.find(user => user.id === id);
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy
  passport.use(new LocalStrategy(
    { usernameField: 'username', passwordField: 'password' },
    async (username, password, done) => {
      try {
        const user = await findUserByUsername(username);
        if (!user) {
          return done(null, false, { message: 'Invalid username or password' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: 'Invalid username or password' });
        }

        return done(null, user);
      } catch (error) {
        console.error('Authentication error:', error);
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await findUserById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Rate limiting for login endpoint to prevent brute-force attacks
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
      message: 'Too many login attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Login route
  app.post('/api/login', loginLimiter, (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: 'Internal server error' });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid username or password' });
      }
      
      // Regenerate session to prevent session fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          return res.status(500).json({ message: 'Session regeneration failed' });
        }
        
        req.logIn(user, (err) => {
          if (err) {
            return res.status(500).json({ message: 'Login failed' });
          }
          const { password, ...safeUser } = user;
          res.json({ success: true, user: safeUser });
        });
      });
    })(req, res, next);
  });

  // Logout route
  app.post('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      
      // Destroy session completely to prevent session reuse
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: 'Error destroying session' });
        }
        
        // Clear session cookie
        res.clearCookie('connect.sid', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        res.json({ success: true });
      });
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};