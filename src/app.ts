import express, { Application } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import errorHandler from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";

import { UserRouter } from "./modules/user/user.router";
import { TutorRouter } from "./modules/tutor/tutor.router";
import { BookingRouter } from "./modules/booking/booking.router";
import { CategoryRouter } from "./modules/category/category.router";
import { ReviewRouter } from "./modules/review/review.router";
import { AuthRouter } from "./modules/auth/auth.router";

const app: Application = express();

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api", AuthRouter);
app.use("/api", UserRouter);
app.use("/api", TutorRouter);
app.use("/api/admin/bookings", BookingRouter);
app.use("/api", CategoryRouter);
app.use("/api/reviews", ReviewRouter);

app.get("/", (req, res) => {
  res.send("SkillBridge API Ready with Better-Auth");
});

app.use(notFound);
app.use(errorHandler);

export default app;
