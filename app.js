import express from "express";
import path from "path";
import cors from "cors";
import session from "express-session";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
import "./config/database.js";

// GraphQL schema
import { schema } from "./graphql/schema.js";

const app = express();

// ------------------ GLOBAL MIDDLEWARE ------------------
app.use(cors());
app.use(express.json()); // Must be before Apollo middleware
app.use(express.static(path.join(__dirname, "public")));

// EJS setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "todo-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// ------------------ Apollo Server Setup ------------------
async function startServer() {
  const server = new ApolloServer({ schema });
  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization || "";
        return { token };
      },
    })
  );

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer();
