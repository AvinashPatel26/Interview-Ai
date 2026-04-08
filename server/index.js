import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import interviewRouter from "./routes/interview.route.js";
import paymentRouter from "./routes/payment.route.js";

dotenv.config();

const app = express();

// ✅ CORS (adjust port if needed)
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter)
app.use("/api/payment", paymentRouter);


// ✅ Test route
app.get("/", (req, res) => {
    res.send("API is running 🚀");
});

// ✅ MongoDB connection
const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("MongoDB connected ✅");
    } catch (error) {
        console.error("DB connection error ❌", error);
        process.exit(1);
    }
};

// ✅ Start server AFTER DB connects
const PORT = process.env.PORT || 8000;

connectDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT} 🚀`);
    });
});