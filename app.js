import express from "express";
import path from "path";
import cors from "cors";
import session from "express-session";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import pino from "pino";
import jwt from "jsonwebtoken";
import router from "./routes/index.js";

const logger = pino();

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
import connectDB from "./config/database.js";

// GraphQL schema
import { schema } from "./graphql/schema.js";

const app = express();
connectDB();

// ------------------ GLOBAL MIDDLEWARE ------------------
app.use(cors());

// CRITICAL: Body parsing middleware MUST come before routes
app.use(express.urlencoded({ extended: true })); // For form data (POST requests)
app.use(express.json()); // For JSON data (GraphQL)

app.use(express.static(path.join(__dirname, "public")));

// Session setup - ONLY ONCE
app.use(
  session({
    secret: process.env.SESSION_SECRET || "todo-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set to true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// EJS setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Routes - IMPORTANT: This must come AFTER body parsing and session middleware
app.use("/", router);

// ------------------ Apollo Server Setup ------------------
async function startServer() {
  const server = new ApolloServer({ schema });
  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.replace("Bearer ", "").trim();

        if (!token) return {};

        try {
          const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
          return { user: { id: decoded.userId } };
        } catch (err) {
          return {}; // token invalid → no user
        }
      },
    })
  );

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
    console.log(`📝 GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
  });
}

startServer();