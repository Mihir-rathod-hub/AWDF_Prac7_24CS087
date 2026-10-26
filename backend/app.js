require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Global Logger Middleware (records method, URL, and timestamp)
app.use(logger);

// 2. Content-Type Validation Middleware (Rejects POST/PUT requests without application/json)
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.toLowerCase().includes('application/json')) {
      return res.status(415).json({
        success: false,
        message: 'Unsupported Media Type: Content-Type must be application/json'
      });
    }
  }
  next();
});

// 3. Built-in JSON Body Parsing Middleware
app.use(express.json());

// Friendly root endpoint for basic health and overview
app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Task Management RESTful API with Authentication (Practical 7) is running.',
    endpoints: {
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        me: 'GET /auth/me'
      },
      tasks: {
        getAllTasks: 'GET /tasks (Auth Required)',
        getTaskById: 'GET /tasks/:id (Auth Required)',
        createTask: 'POST /tasks (Auth Required)',
        updateTask: 'PUT /tasks/:id (Auth Required)',
        deleteTask: 'DELETE /tasks/:id (Auth Required)'
      }
    }
  });
});

// 4. Resource Routes (support both /auth, /tasks and /api/* prefixes)
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/api/tasks', taskRoutes);

// 5. Custom 404 Handler for Unmatched Routes (returns JSON)
app.use((req, res, next) => {
  return res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
});

// 6. Global Error Handling Middleware (must be registered last)
app.use(errorHandler);

// Start server only after database connection succeeds
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`Task Management API server running on port ${PORT}`);
      console.log(`Access the API at http://localhost:${PORT}/tasks`);
    });
    return server;
  } catch (error) {
    console.error('Failed to start server due to database connection error:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
