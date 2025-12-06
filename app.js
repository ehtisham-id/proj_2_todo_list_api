const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
require("./config/database"); // Connect to MongoDB
const { schema } = require("./graphql/schema");

const app = express();

// ------------------ MIDDLEWARE ------------------
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// EJS setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Session & flash messages
app.use(
  session({
    secret: process.env.SESSION_SECRET || "todo-secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

// ------------------ Apollo Server ------------------
async function startApollo() {
  const server = new ApolloServer({ schema });
  await server.start();

  // Apollo v4 + Express integration
  app.use("/graphql", async (req, res, next) => {
    await server.handleRequest(req, res, {
      context: async () => {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.replace("Bearer ", "");
        let user = null;
        if (token) {
          try {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            user = { id: decoded.userId };
          } catch (err) {
            console.log("Invalid JWT token");
          }
        }
        return { user };
      },
    });
  });
}

startApollo();

// ------------------ VIEWS ROUTES ------------------
app.get("/", (req, res) => {
  res.render("index", { title: "Todo App" });
});

app.get("/login", (req, res) => {
  res.render("login", { messages: req.flash("error") });
});

app.get("/register", (req, res) => {
  res.render("register", { messages: req.flash("error") });
});

app.get("/todos", (req, res) => {
  res.render("todos", { title: "My Todos" });
});

// ------------------ START SERVER ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
