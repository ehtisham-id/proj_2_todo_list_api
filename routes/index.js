import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// GraphQL endpoint
const GRAPHQL_ENDPOINT = "http://localhost:3000/graphql";

// Helper function to make GraphQL requests
// Helper function to make GraphQL requests
async function makeGraphQLRequest(query, variables = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    // Check if response is OK
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      // Extract the first error message
      const errorMessages = result.errors.map(err => err.message).join(', ');
      throw new Error(`GraphQL error: ${errorMessages}`);
    }

    return result.data;
  } catch (error) {
    console.error('Error in makeGraphQLRequest:', error.message);

    // Re-throw with a more specific message
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error: Unable to connect to the server. Please check if the server is running.');
    } else if (error.message.includes('HTTP error')) {
      throw new Error(`Server error: ${error.message}`);
    } else {
      throw error; // Re-throw the original error
    }
  }
}

// Helper: Check if user is authenticated
function isAuthenticated(req) {
  return req.session.user && req.session.token;
}

// ---------------- REGISTER PAGE ----------------
router.get("/register", (req, res) => {
  res.render("register", { error: null });
});

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  console.log('Register request body:', req.body);

  // Validate required fields
  if (!email || !password || !name) {
    return res.render("register", {
      error: "All fields are required: email, password, and name"
    });
  }

  const REGISTER_MUTATION = `
    mutation Register($input: RegisterInput!) {
      register(input: $input) {
        message
      }
    }
  `;

  try {
    const data = await makeGraphQLRequest(REGISTER_MUTATION, {
      input: {
        email: String(email).trim(),
        password: String(password),
        name: String(name).trim()
      }
    });

    // If no error thrown, registration was successful
    res.redirect("/login?message=Registration successful! Please login.");
  } catch (err) {
    console.error('Register error:', err);
    res.render("register", { error: err.message });
  }
});

// ---------------- LOGIN PAGE ----------------
// ---------------- LOGIN PAGE ----------------
router.get("/login", (req, res) => {
  const message = req.query.message || null;
  const error = req.query.error || null;
  res.render("login", { error: error, message: message });
});

router.post("/login", async (req, res) => {
  console.log('Login POST received. Body:', req.body);

  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.render("login", {
      error: "Email and password are required"
    });
  }

  const LOGIN_MUTATION = `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        accessToken
        refreshToken
        user {
          id
          email
          name
        }
      }
    }
  `;

  try {
    const data = await makeGraphQLRequest(LOGIN_MUTATION, {
      input: {
        email: email.toString().trim(),
        password: password.toString()
      }
    });

    console.log('Login response data:', data);

    if (data.login && data.login.user) {
      req.session.user = data.login.user;
      req.session.token = data.login.accessToken;
      console.log('Session set:', req.session.user);
      res.redirect("/todos");
    } else {
      // Handle case where login succeeded but no user data returned
      res.render("login", {
        error: "Login failed: Invalid credentials"
      });
    }
  } catch (err) {
    console.error('Login error details:', err);

    // Extract user-friendly error message
    let errorMessage = "Login failed. Please try again.";

    if (err.message.includes('Invalid credentials') ||
      err.message.includes('incorrect') ||
      err.message.includes('not found')) {
      errorMessage = "Invalid email or password. Please try again.";
    } else if (err.message.includes('network') || err.message.includes('Network')) {
      errorMessage = "Network error. Please check your connection and try again.";
    } else if (err.message.includes('GraphQL error')) {
      // Extract the actual GraphQL error message
      const graphqlError = err.message.replace('GraphQL error: ', '');
      errorMessage = graphqlError;
    }

    res.render("login", {
      error: errorMessage
    });
  }
});

// ---------------- LOGOUT ----------------
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

// ---------------- TODOS PAGE ----------------
router.get("/todos", async (req, res) => {
  if (!isAuthenticated(req)) {
    return res.redirect("/login");
  }

  const TODOS_QUERY = `
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
  `;

  try {
    const data = await makeGraphQLRequest(TODOS_QUERY, {}, req.session.token);

    res.render("todos", {
      todos: data.todos || [],
      user: req.session.user,
      error: null,
      success: req.query.success || null
    });
  } catch (err) {
    console.error("Error fetching todos:", err.message);
    res.render("todos", {
      todos: [],
      user: req.session.user,
      error: "Failed to load todos. Please try again.",
      success: null
    });
  }
});

// ---------------- CREATE TODO ----------------
router.post("/todos", async (req, res) => {
  if (!isAuthenticated(req)) {
    return res.redirect("/login");
  }

  const { title, description, dueDate } = req.body;

  console.log('Create todo request body:', req.body);

  // Validate required fields
  if (!title) {
    return res.redirect("/todos?error=Title is required");
  }

  const CREATE_TODO_MUTATION = `
    mutation CreateTodo($input: CreateTodoInput!) {
      createTodo(input: $input) {
        id
        title
        description
        completed
        dueDate
      }
    }
  `;

  try {
    await makeGraphQLRequest(CREATE_TODO_MUTATION, {
      input: {
        title: String(title).trim(),
        description: description ? String(description).trim() : null,
        dueDate: dueDate || null
      }
    }, req.session.token);

    res.redirect("/todos?success=Todo created successfully!");
  } catch (err) {
    console.error("Error creating todo:", err.message);
    res.redirect(`/todos?error=${encodeURIComponent(err.message)}`);
  }
});

// ---------------- UPDATE TODO ----------------
router.post("/todos/:id/update", async (req, res) => {
  if (!isAuthenticated(req)) {
    return res.redirect("/login");
  }

  const { id } = req.params;
  const { title, description, completed, dueDate } = req.body;

  console.log('Update todo request:', { id, body: req.body });

  // Convert completed to boolean
  const completedBool = completed === 'true' || completed === 'on';

  // Build update object
  const updateData = {};
  if (title !== undefined) updateData.title = String(title).trim();
  if (description !== undefined) updateData.description = description ? String(description).trim() : null;
  if (completed !== undefined) updateData.completed = completedBool;
  if (dueDate !== undefined) updateData.dueDate = dueDate || null;

  const UPDATE_TODO_MUTATION = `
    mutation UpdateTodo($id: ID!, $input: UpdateTodoInput!) {
      updateTodo(id: $id, input: $input) {
        id
        title
        completed
      }
    }
  `;

  try {
    await makeGraphQLRequest(UPDATE_TODO_MUTATION, {
      id,
      input: updateData
    }, req.session.token);

    res.redirect("/todos?success=Todo updated successfully!");
  } catch (err) {
    console.error("Error updating todo:", err.message);
    res.redirect(`/todos?error=${encodeURIComponent(err.message)}`);
  }
});

// ---------------- DELETE TODO ----------------
router.post("/todos/:id/delete", async (req, res) => {
  if (!isAuthenticated(req)) {
    return res.redirect("/login");
  }

  const { id } = req.params;

  console.log('Delete todo request:', { id });

  const DELETE_TODO_MUTATION = `
    mutation DeleteTodo($id: ID!) {
      deleteTodo(id: $id) {
        message
      }
    }
  `;

  try {
    await makeGraphQLRequest(DELETE_TODO_MUTATION, {
      id
    }, req.session.token);

    res.redirect("/todos?success=Todo deleted successfully!");
  } catch (err) {
    console.error("Error deleting todo:", err.message);
    res.redirect(`/todos?error=${encodeURIComponent(err.message)}`);
  }
});

// ---------------- HOME PAGE ----------------
router.get("/", (req, res) => {
  res.render("index", {
    title: "Todo App",
    user: req.session.user || null
  });
});

export default router;