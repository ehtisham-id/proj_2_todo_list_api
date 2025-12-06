const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const jwt = require("jsonwebtoken");

const { schema } = require("../src/graphql/schema");
const db = require("./setup");

let app;
let server;
let accessToken;

beforeAll(async () => {
  await db.connect();

  app = express();
  app.use(bodyParser.json());

  server = new ApolloServer({ schema });
  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.replace("Bearer ", "");
        let user = null;
        if (token) {
          try {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || "testsecret");
            user = { id: decoded.userId };
          } catch {}
        }
        return { user };
      },
    })
  );
});

afterAll(async () => {
  await db.closeDatabase();
});

describe("Auth GraphQL", () => {
  it("registers a new user", async () => {
    const mutation = `
      mutation {
        register(input: { name: "Test", email: "test@test.com", password: "123456" }) {
          id
          name
          email
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .send({ query: mutation });

    expect(res.body.data.register.email).toBe("test@test.com");
  });

  it("logs in the user", async () => {
    const mutation = `
      mutation {
        login(input: { email: "test@test.com", password: "123456" }) {
          accessToken
          user {
            id
            email
          }
        }
      }
    `;
    const res = await request(app).post("/graphql").send({ query: mutation });

    expect(res.body.data.login.accessToken).toBeDefined();
    expect(res.body.data.login.user.email).toBe("test@test.com");

    accessToken = res.body.data.login.accessToken;
  });
});

describe("Todo GraphQL", () => {
  it("creates a new todo", async () => {
    const mutation = `
      mutation {
        createTodo(input: { title: "Test Todo", description: "Testing" }) {
          title
          description
          completed
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ query: mutation });

    expect(res.body.data.createTodo.title).toBe("Test Todo");
    expect(res.body.data.createTodo.completed).toBe(false);
  });

  it("fetches todos", async () => {
    const query = `
      query {
        getTodos {
          title
          description
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ query });

    expect(res.body.data.getTodos.length).toBe(1);
    expect(res.body.data.getTodos[0].title).toBe("Test Todo");
  });
});
