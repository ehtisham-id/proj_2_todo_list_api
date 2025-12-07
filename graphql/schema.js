import { makeExecutableSchema } from "@graphql-tools/schema";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { authDirective, authDirectiveTransformer } from "./directives/auth.directive.js";
import { authResolver } from "./resolvers/auth.resolver.js";
import { todoResolver } from "./resolvers/todo.resolver.js";
import { userResolver } from "./resolvers/user.resolver.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadGQL = (file) =>
  fs.readFileSync(path.join(__dirname, "typeDef", file), "utf8");

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