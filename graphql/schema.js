const { makeExecutableSchema } = require("@graphql-tools/schema");
const fs = require("fs");
const path = require("path");

const { authDirective, authDirectiveTransformer } = require("./directives/authDirective");
const { authResolver } = require("./resolvers/authResolver");
const { todoResolver } = require("./resolvers/todoResolver");
const { userResolver } = require("./resolvers/userResolver");


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadGQL = (file) => fs.readFileSync(path.join(__dirname, "typeDefs", file), "utf-8");

const typeDefs = [
  loadGQL("root.gql"),
  loadGQL("user.gql"),
  loadGQL("todo.gql"),
  loadGQL("auth.gql"),
  authDirective,
];

const resolvers = {
  Query: {
    ...userResolver.Query,
    ...todoResolver.Query,
  },
  Mutation: {
    ...authResolver.Mutation,
    ...todoResolver.Mutation,
  },
  Todo: {
    isOverdue: (parent) => parent.isOverdue,
  },
};

let schema = makeExecutableSchema({ typeDefs, resolvers });
schema = authDirectiveTransformer(schema);

export { schema };
