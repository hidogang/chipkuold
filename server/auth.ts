import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
      httpOnly: true
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Enhanced logging middleware for debugging auth
  app.use((req, res, next) => {
    console.log('[Auth Debug] Session ID:', req.sessionID);
    console.log('[Auth Debug] User:', req.user);
    console.log('[Auth Debug] Is Admin:', req.user?.isAdmin);
    console.log('[Auth Debug] Session:', req.session);
    next();
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log("[Auth] Attempting login for user:", username);
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log("[Auth] User not found:", username);
          return done(null, false);
        }

        // Special case for admin user with enhanced logging
        if (username === "adminraja") {
          console.log("[Auth] Admin login attempt");
          if (password === "admin8751") {
            console.log("[Auth] Admin login successful");
            return done(null, { ...user, isAdmin: true });
          } else {
            console.log("[Auth] Admin login failed: Incorrect password");
            return done(null, false);
          }
        }

        const passwordMatch = await comparePasswords(password, user.password);
        console.log("[Auth] Password match result:", passwordMatch);

        if (!passwordMatch) {
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        console.error("[Auth] Login error:", err);
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    console.log("[Auth] Serializing user:", user.id, "isAdmin:", user.isAdmin);
    done(null, { id: user.id, isAdmin: user.isAdmin });
  });

  passport.deserializeUser(async (data: { id: number; isAdmin: boolean }, done) => {
    try {
      console.log("[Auth] Deserializing user:", data);
      const user = await storage.getUser(data.id);
      if (!user) {
        console.log("[Auth] User not found during deserialization:", data.id);
        return done(new Error("User not found"));
      }
      console.log("[Auth] User deserialized successfully:", data.id, "isAdmin:", data.isAdmin);
      done(null, { ...user, isAdmin: data.isAdmin });
    } catch (err) {
      console.error("[Auth] Deserialization error:", err);
      done(err);
    }
  });

  // Enhanced isAdmin middleware
  app.use((req: any, res, next) => {
    if (req.path.startsWith('/api/admin/')) {
      console.log('[Admin Check] Request to admin endpoint:', req.path);
      console.log('[Admin Check] User:', req.user);
      console.log('[Admin Check] IsAdmin:', req.user?.isAdmin);

      if (!req.isAuthenticated()) {
        console.log('[Admin Check] User not authenticated');
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!req.user?.isAdmin) {
        console.log('[Admin Check] User not admin');
        return res.status(403).json({ error: 'Admin access required' });
      }
    }
    next();
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("[Auth] Registration attempt for:", req.body.username);
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log("[Auth] Registration failed - username exists:", req.body.username);
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check referral code if provided
      if (req.body.referredBy) {
        const referrer = await storage.getUserByReferralCode(req.body.referredBy);
        if (!referrer) {
          console.log("[Auth] Registration failed - invalid referral code:", req.body.referredBy);
          return res.status(400).json({ message: "Invalid referral code" });
        }
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      console.log("[Auth] Registration successful for:", user.username);
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      console.error("[Auth] Registration error:", err);
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("[Auth] Login attempt for:", req.body.username);
    passport.authenticate("local", (err: Error | null, user: SelectUser | false, info: any) => {
      if (err) {
        console.error("[Auth] Login error:", err);
        return next(err);
      }
      if (!user) {
        console.log("[Auth] Login failed for:", req.body.username);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) {
          console.error("[Auth] Session creation error:", err);
          return next(err);
        }
        console.log("[Auth] Login successful for:", user.username);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    const username = req.user?.username;
    console.log("[Auth] Logout attempt for:", username);
    req.logout((err) => {
      if (err) {
        console.error("[Auth] Logout error:", err);
        return next(err);
      }
      console.log("[Auth] Logout successful for:", username);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log("[Auth] User check - Is authenticated:", req.isAuthenticated());
    console.log("[Auth] User check - Session:", req.session);
    console.log("[Auth] User check - User:", req.user);

    if (!req.isAuthenticated()) {
      console.log("[Auth] User check failed - not authenticated");
      return res.sendStatus(401);
    }
    res.json(req.user);
  });
}