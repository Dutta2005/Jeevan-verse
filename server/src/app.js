import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config({path: "./.env"});

const app = express();

console.log(process.env.CORS_ORIGIN);
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    // origin: "https://jeevan-verse.vercel.app",
    credentials: true
}))

app.use(express.json({limit: "20kb"}));
app.use(express.urlencoded({extended: true, limit: "20kb"}));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import organizationRouter from "./routes/organization.routes.js";
import chatRoutes from './routes/chatbot.routes.js';
import postRouter from "./routes/post.routes.js";
import commentRouter from "./routes/comment.routes.js";

// routers
app.use("/api/v1/users", userRouter);
app.use("/api/v1/organizations", organizationRouter);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/comments", commentRouter);


export {app}