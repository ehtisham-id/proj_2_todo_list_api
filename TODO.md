# TODO

## High Priority
- Fix `graphql/schema.js` path/import issues: add `fileURLToPath` import, point to `graphql/typeDef` folder, and ensure ESM-only imports (remove mixed `require`/`export`).
- Add missing imports in `User.js` for `Todo` and `RefreshToken` used in cascade delete; call `next()` in hooks.
- Align server bootstrap: `package.json` uses `nodemon ./bin/www` (CommonJS) while app is ESM. Either convert `bin/www` to ESM or run `node app.js` with an HTTP server wrapper.
- Add missing runtime deps: `node-fetch` (routes), `ms` (token.service), and dev dep `nodemon` (used in `npm start`).
- Configure JWT secrets/expiry defaults in `.env` and guard against missing values in code.

## Dependency Cleanup
- Remove unused: `appolo`, `body-parser`, `connect-flash`, `cookie-parser`, `graphql-tools`, `http-errors`, `morgan`, `nodemailer` (currently unused), `crypto` npm package (Node has built-in), and `body-parser` usage in tests.
- Consider replacing `node-fetch` with built-in `fetch` (Node 18+) to drop that dependency.

## GraphQL & API
- Ensure auth directive imports `defaultFieldResolver` and throws consistently; propagate user context through Express routes.
- Add null checks in resolvers for unauthenticated access; improve error messages for `todo` queries/mutations.
- Standardize date handling for `dueDate` (ISO in/out) and validate inputs.

## Testing
- Fix test setup paths (`../src/graphql/schema` should match `../graphql/schema.js`), middleware imports, and adjust queries (`todos` not `getTodos`).
- Replace `body-parser` in tests with `express.json()`; use in-memory Mongo (`mongodb-memory-server`) with proper lifecycle.

## Email & Verification
- `config/email.js` imports `nodemailer` incorrectly (should be default import) and is unused. Either wire it into registration for verification emails or drop it and the dependency.

## Miscellaneous
- Add basic validation middleware for forms/GraphQL inputs.
- Tighten logging (pino) levels and remove console.logs in production paths.
- Add linting/formatting (ESLint/Prettier) and environment example file `.env.example`.
