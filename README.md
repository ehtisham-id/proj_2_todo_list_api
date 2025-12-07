# Todo List API

A full-featured Todo List application built with **Express.js**, **GraphQL**, **MongoDB**, and **Node.js**. This project demonstrates modern backend development practices with authentication, authorization, and a robust API structure.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Models](#models)
- [Testing](#testing)
- [Project Scripts](#project-scripts)

## 🎯 Overview

This is a backend tutorial project (Proj_2) that implements a complete Todo List API with user authentication, JWT-based authorization, and GraphQL endpoints. The application uses MongoDB for data persistence and keeps a placeholder hook for email verification tokens.

## ✨ Features

- **User Authentication**: Registration and login with secure password hashing using bcrypt
- **Email Verification (placeholder)**: Verification token generated on registration; email sending is not wired yet
- **JWT Authentication**: Token-based authorization for protected endpoints
- **GraphQL API**: Modern GraphQL schema with queries and mutations
- **Todo Management**: Create, read, update, and delete todos
- **Authorization Directives**: GraphQL directives for role-based access control
- **Express Session Management**: Session handling with flash messages
- **CORS Support**: Cross-Origin Resource Sharing enabled
- **Error Handling**: Comprehensive error handling and logging with Pino
- **Testing**: Jest and Supertest for unit and integration testing

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (v4.22.1)
- **API**: GraphQL (v16.12.0) with Apollo Server (v5.2.0)
- **Database**: MongoDB with Mongoose (v9.0.1)

### Authentication & Security
- **JWT**: jsonwebtoken (v9.0.3)
- **Password Hashing**: bcrypt (v6.0.0)
- **CORS**: cors (v2.8.5)
- **Session**: express-session (v1.18.2)

### Additional Libraries
- **Email**: nodemailer (v7.0.11) — currently unused
- **Logging**: Pino (v10.1.0)
- **Environment**: dotenv (v17.2.3)
- **View Engine**: EJS (v3.1.10)
- **HTTP client**: node-fetch (v3.3.2) for server-side GraphQL calls from routes

### Development & Testing
- **Testing Framework**: Jest
- **HTTP Testing**: Supertest
- **In-Memory MongoDB**: mongodb-memory-server
- **File Watching**: Nodemon
- **TypeScript Support**: @types/jest

## 📁 Project Structure

```
Proj_2_ToDo_List_API/
├── .env                              # Environment variables (not in repo)
├── config/
│   ├── database.js                   # MongoDB connection configuration
│   ├── email.js                      # Email service configuration
│   └── jwt.js                        # JWT configuration
├── graphql/
│   ├── schema.js                     # GraphQL schema definition
│   ├── directives/
│   │   └── auth.directive.js         # Authorization directive
│   ├── resolvers/
│   │   ├── auth.resolver.js          # Authentication resolvers
│   │   ├── todo.resolver.js          # Todo resolvers
│   │   └── user.resolver.js          # User resolvers
│   └── typeDef/
│       ├── auth.gql                  # Authentication type definitions
│       ├── root.gql                  # Root schema definitions
│       ├── todo.gql                  # Todo type definitions
│       └── user.gql                  # User type definitions
├── models/
│   ├── User.js                       # User Mongoose schema
│   ├── Todo.js                       # Todo Mongoose schema
│   └── RefreshToken.js               # Refresh token Mongoose schema
├── routes/
│   └── index.js                      # Express routes rendering EJS views and proxying GraphQL
├── services/
│   ├── auth.service.js               # Authentication business logic
│   ├── todo.service.js               # Todo business logic
│   └── token.service.js              # Token management logic
├── public/
│   ├── images/                       # Static images
│   ├── javascripts/                  # Client-side JavaScript
│   └── stylesheets/
│       └── style.css                 # Application styles
├── views/
│   ├── error.ejs                     # Error page template
│   ├── index.ejs                     # Home page template
│   ├── login.ejs                     # Login page template
│   ├── register.ejs                  # Registration page template
│   └── todos.ejs                     # Todos page template
├── test/
│   ├── api.test.js                   # API integration tests
│   └── setup.js                      # Test setup and configuration
├── TODO.md                           # Open tasks and cleanup items
├── app.js                            # Express app configuration & GraphQL server
├── package.json                      # Project dependencies and scripts
└── README.md                         # This file
```

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Steps

1. **Clone or navigate to the project directory**
   ```bash
   cd Proj_2_ToDo_List_API
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install development dependencies** (for testing)
  ```bash
  npm install --save-dev jest supertest mongodb-memory-server @types/jest
  ```

4. **(Optional) Remove unused dependencies**
  ```bash
  npm uninstall appolo body-parser connect-flash cookie-parser cross-fetch crypto debug graphql-tools http-errors morgan nodemailer
  ```
  These packages are currently not used in the codebase. Keep `nodemailer` only if you plan to implement email delivery.

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/todo-list

# JWT Configuration
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_ACCESS_EXPIRY=24h
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_REFRESH_EXPIRY=7d

# Session
SESSION_SECRET=your_session_secret_key_here

# Email Configuration (Nodemailer - unused by default)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_app_password

# Logging
LOG_LEVEL=info
```

### Configuration Files

- **`config/database.js`**: MongoDB connection setup with Mongoose
- **`config/jwt.js`**: JWT secret and expiration settings
- **`config/email.js`**: Email service provider configuration

## 🚀 Running the Project

### Development Mode (with reload)
```bash
npm run dev
```
Uses nodemon for auto-restart on changes.

### Production/Basic Run
```bash
npm start
```
Runs `node app.js`.

### Test Mode
```bash
npm test
```
Runs Jest tests with open handles detection and force exit enabled.

## 📡 API Documentation

### GraphQL Endpoint
**Endpoint**: `POST /graphql`

The application uses Apollo Server to provide a GraphQL API. You can access the Apollo Sandbox at `/graphql` when the server is running.

### Authentication Endpoints

#### Register User
```graphql
mutation Register($email: String!, $password: String!, $name: String!) {
  register(email: $email, password: $password, name: $name) {
    id
    email
    name
    isVerified
  }
}
```

#### Login User
```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    refreshToken
    user {
      id
      email
      name
    }
  }
}
```

### Todo Endpoints

#### Get All Todos (Authenticated)
```graphql
query {
  todos {
    id
    title
    description
    completed
    dueDate
    isOverdue
    createdAt
  }
}
```

#### Create Todo
```graphql
mutation CreateTodo($title: String!, $description: String, $dueDate: Date) {
  createTodo(title: $title, description: $description, dueDate: $dueDate) {
    id
    title
    description
    completed
    dueDate
  }
}
```

#### Update Todo
```graphql
mutation UpdateTodo($id: ID!, $title: String, $description: String, $completed: Boolean, $dueDate: Date) {
  updateTodo(id: $id, title: $title, description: $description, completed: $completed, dueDate: $dueDate) {
    id
    title
    completed
  }
}
```

#### Delete Todo
```graphql
mutation DeleteTodo($id: ID!) {
  deleteTodo(id: $id)
}
```

## 🔐 Authentication

The project uses **JWT (JSON Web Tokens)** for authentication:

1. **User Registration**: Creates a new user with hashed password and sends verification email
2. **User Login**: Returns access token and refresh token
3. **Protected Routes**: Use `@auth` directive in GraphQL schema for authorization
4. **Token Verification**: Middleware validates JWT tokens from request headers

### Authorization Header Format
```
Authorization: Bearer <your_jwt_token_here>
```

## 📊 Models

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required, min 8 chars),
  name: String (required),
  isVerified: Boolean (default: false),
  // Additional fields for email verification
}
```

### Todo Model
```javascript
{
  user: ObjectId (reference to User),
  title: String (required),
  description: String (optional),
  completed: Boolean (default: false),
  dueDate: Date (optional),
  isOverdue: Boolean (virtual field),
  timestamps: true (createdAt, updatedAt)
}
```

### RefreshToken Model
Used to manage JWT refresh tokens for enhanced security.

## 🧪 Testing

The project uses **Jest** for unit testing and **Supertest** for HTTP assertion.

### Running Tests
```bash
npm test
```

### Test Files
- **`test/api.test.js`**: Integration tests for API endpoints
- **`test/setup.js`**: Test environment setup and configuration

### Test Configuration
- Uses `mongodb-memory-server` for in-memory MongoDB testing
- Detects open handles and forces exit after test completion

## 📜 Project Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the server in development mode with Nodemon |
| `npm test` | Run Jest tests with open handles detection |

## 🌐 Middleware

### Authentication Middleware (`middleware/auth.middleware.js`)
- Validates JWT tokens from request headers
- Extracts user information from tokens
- Passes user context to resolvers

### Validation Middleware (`middleware/validation.middleware.js`)
- Validates request payload
- Ensures data integrity and type safety

## 📝 License

This is a tutorial project for educational purposes.

## 🤝 Contributing

This is a personal tutorial project. Feel free to fork and modify for learning purposes.

## 📞 Support

For issues or questions, refer to the project documentation or GraphQL schema definitions.

---

**Last Updated**: December 2025
**Project Version**: 0.0.0
