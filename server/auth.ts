import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { hashPassword, comparePasswords } from './auth-utils';

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
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
    name: 'chickfarms.sid'
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log("[Auth] Attempting login for user:", username);
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log("[Auth] User not found:", username);
          return done(null, false, { message: "Invalid credentials" });
        }

        // Special handling for admin user
        if (username === "adminraja" && user.isAdmin) {
          const passwordMatch = await comparePasswords(password, user.password);
          console.log("[Auth] Admin login attempt - Password match:", passwordMatch);
          if (!passwordMatch) {
            return done(null, false, { message: "Invalid credentials" });
          }
          return done(null, user);
        }

        const passwordMatch = await comparePasswords(password, user.password);
        console.log("[Auth] Password match result:", passwordMatch);

        if (!passwordMatch) {
          return done(null, false, { message: "Invalid credentials" });
        }

        return done(null, user);
      } catch (err) {
        console.error("[Auth] Login error:", err);
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    console.log("[Auth] Serializing user:", user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log("[Auth] Deserializing user:", id);
      const user = await storage.getUser(id);
      if (!user) {
        console.log("[Auth] User not found during deserialization:", id);
        return done(null, false);
      }
      done(null, user);
    } catch (err) {
      console.error("[Auth] Deserialization error:", err);
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("[Auth] Registration attempt for:", req.body.username);
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log("[Auth] Registration failed - username exists:", req.body.username);
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      console.log("[Auth] Registration successful for:", user.username);
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({
          id: user.id,
          username: user.username
        });
      });
    } catch (err) {
      console.error("[Auth] Registration error:", err);
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("[Auth] Login attempt for:", req.body.username);
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: any) => {
      if (err) {
        console.error("[Auth] Login error:", err);
        return next(err);
      }
      if (!user) {
        console.log("[Auth] Login failed for:", req.body.username);
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) {
          console.error("[Auth] Session creation error:", err);
          return next(err);
        }
        console.log("[Auth] Login successful for:", user.username, "isAdmin:", user.isAdmin);
        res.json({
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
          usdtBalance: user.usdtBalance
        });
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
      req.session.destroy((err) => {
        if (err) {
          console.error("[Auth] Session destruction error:", err);
          return next(err);
        }
        res.clearCookie('chickfarms.sid');
        console.log("[Auth] Logout successful for:", username);
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res) => {
    console.log("[Auth] User check - Is authenticated:", req.isAuthenticated());
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = req.user;
    res.json({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      usdtBalance: user.usdtBalance
    });
  });
}