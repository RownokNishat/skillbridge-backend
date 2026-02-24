import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import errorHandler from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import { prisma } from "./lib/prisma";

import { UserRouter } from "./modules/user/user.router";
import { TutorRouter } from "./modules/tutor/tutor.router";
import { BookingRouter } from "./modules/booking/booking.router";
import { CategoryRouter } from "./modules/category/category.router";
import { ReviewRouter } from "./modules/review/review.router";
import { AuthRouter } from "./modules/auth/auth.router";
import { RegistrationRouter } from "./modules/registration/registration.router";
import { StudentRouter } from "./modules/student/student.router";

const app = express();

const vercelOrigin = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined;

const allowedOrigins = new Set(
  [
    process.env.APP_URL,
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGINS,
    vercelOrigin,
    "http://localhost:3000",
    "https://skillbridge-frontend-dun.vercel.app",
  ]
    .flatMap((value) => (value ? value.split(",") : []))
    .map((value) => value.trim())
    .filter(Boolean),
);

const isAllowedOrigin = (origin?: string) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.has(origin)) {
    return true;
  }

  // Allow SkillBridge frontend preview deployments on Vercel.
  return (
    origin.startsWith("https://skillbridge-frontend-") &&
    origin.endsWith(".vercel.app")
  );
};

// Connect to database on cold start
prisma.$connect().catch(console.error);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
};

app.use(cors(corsOptions));

app.use(express.json());

app.options(/.*/, cors(corsOptions));
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api", RegistrationRouter);
app.use("/api", AuthRouter);
app.use("/api", UserRouter);
app.use("/api", TutorRouter);
app.use("/api", StudentRouter);
app.use("/api/bookings", BookingRouter);
app.use("/api", CategoryRouter);
app.use("/api/reviews", ReviewRouter);

app.get("/", (req, res) => {
  res.send("SkillBridge API Ready with Better-Auth");
});

app.use(notFound);
app.use(errorHandler);

export default app;
