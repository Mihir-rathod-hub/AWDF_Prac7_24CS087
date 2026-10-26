# Advanced Web Development Frameworks — Practical 7
## Authentication and Middleware Pipeline (React + Node.js + Express + MongoDB)

- **Student Name**: Mihir Rathod
- **Student ID**: 24CS087
- **Course**: Advanced Web Development Frameworks (AWDF)
- **Repository**: [AWDF_Prac7_24CS087](https://github.com/Mihir-rathod-hub/AWDF_Prac7_24CS087.git)

---

## Overview

This repository contains the complete full-stack implementation of **Practical 7: Authentication and Middleware Pipeline**, built upon the Task Management system. The project implements end-to-end user authentication using JSON Web Tokens (JWT) and Bcrypt password hashing, request logging and authentication middleware, user session recovery, and strict task ownership authorization.

### Architecture

```
AWDF_Prac7_24CS087/
├── frontend/             # React 19 + Vite client application
│   ├── src/
│   │   ├── components/   # UI Components (AuthCard, TaskManager, TaskForm, etc.)
│   │   ├── context/      # AuthContext & useAuth hook for session management
│   │   ├── services/     # authService.js & taskService.js (HTTP fetch client)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js    # Dev proxy: /api/* -> http://localhost:3000/*
│
└── backend/              # Node.js + Express + Mongoose REST API
    ├── config/           # MongoDB database connection (db.js)
    ├── middleware/       # JWT auth verification, error handler, request logger
    ├── models/           # Mongoose models: User.js (bcrypt hashed), Task.js (user ownership)
    ├── routes/           # authRoutes.js (/auth/register, /auth/login, /auth/me), taskRoutes.js
    ├── .env.example      # Environment variables template
    ├── app.js            # Express server entry point
    └── package.json
```

---

## Key Features

### 1. User Authentication (JWT & Bcrypt)
- **Registration (`POST /auth/register`)**: Validates required `name`, `email`, and `password` (minimum 6 characters). Passwords are salted and hashed with **bcrypt (10 rounds)** before persisting to MongoDB.
- **Login (`POST /auth/login`)**: Verifies credentials using `bcrypt.compare`, signs a **JSON Web Token (1-hour expiry)** containing the user's ID, and returns user details without exposing password hashes.
- **Current User Profile (`GET /auth/me`)**: Protected route returning the safe user profile of the authenticated requester.

### 2. Middleware Pipeline
- **Authentication Middleware (`middleware/auth.js`)**: Validates the `Authorization: Bearer <token>` header, verifies the JWT using `process.env.JWT_SECRET`, looks up the user, and attaches `req.user` to the request pipeline. Returns `401 Unauthorized` for missing, expired, or invalid tokens.
- **Request Logger (`middleware/logger.js`)**: Logs HTTP method, path, and timestamps for all incoming requests.
- **Centralized Error Handler (`middleware/errorHandler.js`)**: Safely catches unhandled errors and returns consistent JSON responses.

### 3. Task Ownership Authorization & Anti-Enumeration Security
- Tasks in MongoDB include a `user` reference field.
- `GET /tasks`: Automatically filters tasks by `user: req.user._id`.
- `GET /tasks/:id`, `PUT /tasks/:id`, `DELETE /tasks/:id`: Strictly scoped to `{ _id: id, user: req.user._id }`.
- Any attempt to access, update, or delete a task belonging to another user or an unowned task returns a uniform **`404 Not Found`** to prevent ID enumeration.

### 4. Modern React Frontend
- Clean, professional user interface without extraneous academic banners or button emojis.
- Form validation for required full name, email, and password.
- Reactive session handling: stores JWT in `localStorage`, restores session on page reload via `/auth/me`, and redirects to login upon 401 expiration.
- Complete CRUD operations, real-time status filters (`All`, `Pending`, `Completed`), instant text search, and deletion confirmation modal.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017/taskmanager_db`

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env if needed (default port is 3000, JWT_SECRET set to your secret)
npm start
# Server runs on http://localhost:3000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Application runs on http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new user account (`name`, `email`, `password`) |
| `POST` | `/auth/login` | Public | Authenticate user & return signed JWT |
| `GET` | `/auth/me` | Bearer Token | Get authenticated user profile |
| `GET` | `/tasks` | Bearer Token | Retrieve all tasks owned by authenticated user |
| `POST` | `/tasks` | Bearer Token | Create new task owned by authenticated user |
| `GET` | `/tasks/:id` | Bearer Token | Get specific task owned by authenticated user |
| `PUT` | `/tasks/:id` | Bearer Token | Update task owned by authenticated user |
| `DELETE` | `/tasks/:id` | Bearer Token | Delete task owned by authenticated user |
