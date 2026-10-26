# Task Management RESTful API with MongoDB & Mongoose

> **Course:** Advanced Web Development Frameworks (ITUE301)  
> **Practical 5:** MongoDB Integration and Schema Design with Mongoose  
> *(Extending Practical 4: Building a RESTful API with Node.js and Express)*

A complete, production-grade backend RESTful API for managing tasks, built using **Node.js**, **Express**, **MongoDB**, and **Mongoose ODM**. This project extends the Practical 4 architecture by transitioning from an ephemeral in-memory store to persistent database storage with schema-level validation, pre-save hooks, and structured error handling.

---

## 📌 Features & Enhancements in Practical 5

- **MongoDB & Mongoose Integration:** Fully replaced in-memory array storage with MongoDB using Mongoose schemas and models.
- **Persistent Data Storage:** Data is saved in the `taskmanager_db` database and persists permanently across server restarts.
- **Strict Schema Design (`models/Task.js`):**
  - `title`: String, required, auto-trimmed, non-whitespace constraint.
  - `description`: String, optional, defaults to `""`.
  - `completed`: Boolean, defaults to `false`.
  - `priority`: String, enum restricted to `low`, `medium`, `high`, defaults to `medium`.
  - `createdAt`: Date, defaults to `Date.now`.
  - `_id`: 24-character hexadecimal MongoDB `ObjectId`.
- **Pre-Save Lifecycle Hook:** Automatically trims title strings and guarantees whitespace-only titles fail validation.
- **Mongoose Query Methods:** Uses `Task.find()`, `Task.findById()`, `Task.create()`, `Task.findByIdAndUpdate({ new: true, runValidators: true })`, and `Task.findByIdAndDelete()`.
- **Robust ObjectId Validation:** Validates 24-character hex strings before querying MongoDB, preventing database cast errors and returning clean HTTP `400 Bad Request` messages.
- **Environment Configuration:** Manages settings via `dotenv` and `.env` (`PORT`, `MONGO_URI`).
- **Fail-Safe Server Startup:** Connects to MongoDB before starting the Express listener, ensuring the server never accepts requests in a disconnected state.
- **Standardized Middleware Pipeline:** Maintains global request logging, strict `Content-Type: application/json` enforcement (HTTP `415`), custom JSON 404 handler, and global error handling with field-level Mongoose validation messages.

---

## 📁 Project Structure

```text
AWDF_Prac_4/
├── app.js                   # Application bootstrap, async DB connection, and middleware pipeline
├── config/
│   └── db.js                # MongoDB connection management using Mongoose
├── models/
│   └── Task.js              # Mongoose Task Schema, pre-save hook, and Model definition
├── routes/
│   └── taskRoutes.js        # REST endpoints utilizing Mongoose Model operations & ObjectId validation
├── middleware/
│   ├── logger.js            # Request logging middleware (method, URL, ISO timestamp)
│   └── errorHandler.js      # Global error handler (handles Mongoose validation, CastError, and malformed JSON)
├── .env                     # Local environment variables (excluded by .gitignore)
├── .env.example             # Example environment template
├── package.json             # Project dependencies (express, mongoose, dotenv, nodemon)
├── package-lock.json        # Exact dependency lockfile
├── .gitignore               # Git exclusions (node_modules, .env, logs)
└── README.md                # Documentation, schema specs, Postman guide, and Compass verification
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root (reference [.env.example](file:///c:/Users/Admin/Downloads/AWDF_Prac_4/.env.example)):

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/taskmanager_db
```

> 🔒 **Security Notice:** The `.env` file is excluded from Git via `.gitignore` to prevent credentials from ever being leaked or committed.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **MongoDB** running locally on port `27017` (or a MongoDB Atlas connection string)
- **MongoDB Compass** (optional GUI for database inspection)

Verify local MongoDB service is listening:
```bash
mongosh --eval "db.adminCommand('ping')"
```

### 2. Installation
Install project dependencies (`express`, `mongoose`, `dotenv`, and devDependency `nodemon`):
```bash
npm install
```

### 3. Running the Server

#### Standard Start:
```bash
npm start
```

#### Development Mode (Auto-reload on save via Nodemon):
```bash
npm run dev
```

Console output upon successful startup:
```text
[MongoDB] Connected successfully to host: 127.0.0.1, database: taskmanager_db
Task Management API server running on port 3000
Access the API at http://localhost:3000/tasks
```

---

## 🗄️ Mongoose Schema Details (`models/Task.js`)

| Field | Type | Required | Default | Validation Rules / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Auto | Generated | 24-character hexadecimal MongoDB identifier |
| `title` | `String` | **Yes** | None | Trimmed; cannot be empty or whitespace-only (enforced via schema validator and pre-save hook) |
| `description` | `String` | No | `""` | Optional string |
| `completed` | `Boolean` | No | `false` | Boolean status flag |
| `priority` | `String` | No | `"medium"` | Enum restricted: `"low"`, `"medium"`, or `"high"` |
| `createdAt` | `Date` | No | `Date.now` | ISO date of creation |

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Expected Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API status and route discovery | `200 OK` |
| `GET` | `/tasks` | Retrieve all tasks from MongoDB (sorted newest first) | `200 OK` |
| `GET` | `/tasks/:id` | Retrieve single task by 24-character ObjectId | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `POST` | `/tasks` | Create a new task (applies schema defaults) | `201 Created` / `400 Bad Request` / `415 Unsupported Media Type` |
| `PUT` | `/tasks/:id` | Update an existing task (`runValidators: true`) | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `DELETE` | `/tasks/:id` | Delete a task from MongoDB | `200 OK` / `400 Bad Request` / `404 Not Found` |

---

## 📝 Request & Response Specifications

### 1. Get All Tasks
- **URL:** `GET /tasks`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "6ace5dd66bb5f8339c96acd7",
      "title": "Learn Mongoose Schema Design",
      "description": "Complete Practical 5 for AWDF",
      "completed": false,
      "priority": "high",
      "createdAt": "2026-10-13T16:35:34.422Z"
    }
  ]
}
```

---

### 2. Get Task by ID
- **URL:** `GET /tasks/:id`
- **Example:** `GET /tasks/6ace5dd66bb5f8339c96acd7`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "_id": "6ace5dd66bb5f8339c96acd7",
    "title": "Learn Mongoose Schema Design",
    "description": "Complete Practical 5 for AWDF",
    "completed": false,
    "priority": "high",
    "createdAt": "2026-10-13T16:35:34.422Z"
  }
}
```
- **Error Response (`404 Not Found`):**
```json
{
  "success": false,
  "message": "Task with ID '6ace5dd66bb5f8339c96acd7' not found."
}
```
- **Invalid ID Format (`400 Bad Request`):**
```json
{
  "success": false,
  "message": "Invalid task ID format: '123'. Must be a 24-character hexadecimal ObjectId."
}
```

---

### 3. Create a Task
- **URL:** `POST /tasks`
- **Headers:** `Content-Type: application/json`
- **Request Body (Full Payload):**
```json
{
  "title": "Build Practical 5 Task API",
  "description": "Integrate MongoDB with Express and Mongoose",
  "completed": false,
  "priority": "high"
}
```
- **Request Body (Minimal Payload — Testing Defaults):**
```json
{
  "title": "Only Title Provided"
}
```
- **Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Task created successfully.",
  "data": {
    "_id": "6ace5dd66bb5f8339c96acd8",
    "title": "Only Title Provided",
    "description": "",
    "completed": false,
    "priority": "medium",
    "createdAt": "2026-10-13T16:35:34.440Z"
  }
}
```

- **Validation Error Responses (`400 Bad Request`):**
  - **Whitespace-only title:**
    ```json
    {
      "success": false,
      "message": "Validation failed.",
      "errors": {
        "title": "Title is required and cannot be empty or contain only whitespace."
      }
    }
    ```
  - **Invalid Priority Value:**
    ```json
    {
      "success": false,
      "message": "Validation failed.",
      "errors": {
        "priority": "'urgent' is not a valid priority. Allowed values: low, medium, high."
      }
    }
    ```

---

### 4. Update a Task
- **URL:** `PUT /tasks/:id`
- **Example:** `PUT /tasks/6ace5dd66bb5f8339c96acd7`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "completed": true,
  "priority": "low"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Task updated successfully.",
  "data": {
    "_id": "6ace5dd66bb5f8339c96acd7",
    "title": "Build Practical 5 Task API",
    "description": "Integrate MongoDB with Express and Mongoose",
    "completed": true,
    "priority": "low",
    "createdAt": "2026-10-13T16:35:34.422Z"
  }
}
```

---

### 5. Delete a Task
- **URL:** `DELETE /tasks/:id`
- **Example:** `DELETE /tasks/6ace5dd66bb5f8339c96acd7`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Task deleted successfully.",
  "data": {
    "_id": "6ace5dd66bb5f8339c96acd7",
    "title": "Build Practical 5 Task API",
    "description": "Integrate MongoDB with Express and Mongoose",
    "completed": true,
    "priority": "low",
    "createdAt": "2026-10-13T16:35:34.422Z"
  }
}
```

---

## 🧪 Postman Step-by-Step Testing Guide

### Step 1: Create a Collection in Postman
1. Open Postman, click **New Collection** and name it `AWDF Practical 5 - MongoDB Task API`.
2. Add a collection variable:
   - `baseUrl`: `http://localhost:3000`

### Step 2: Test Suite Flow
1. **GET `/tasks`**
   - Method: `GET`
   - URL: `{{baseUrl}}/tasks`
   - Expect: `200 OK` with JSON array.
2. **POST `/tasks` (Create Task)**
   - Method: `POST`
   - URL: `{{baseUrl}}/tasks`
   - Header: `Content-Type: application/json`
   - Body (`raw JSON`):
     ```json
     {
       "title": "Complete Mongoose Schema Lab",
       "description": "Demonstrate schema validation and hooks",
       "priority": "high"
     }
     ```
   - Expect: `201 Created`. Copy the generated `_id` value from the response.
3. **GET `/tasks/:id`**
   - Method: `GET`
   - URL: `{{baseUrl}}/tasks/<PASTE_ID_HERE>`
   - Expect: `200 OK` returning the matching task.
4. **PUT `/tasks/:id`**
   - Method: `PUT`
   - URL: `{{baseUrl}}/tasks/<PASTE_ID_HERE>`
   - Header: `Content-Type: application/json`
   - Body (`raw JSON`):
     ```json
     {
       "completed": true
     }
     ```
   - Expect: `200 OK` with `completed: true`.
5. **DELETE `/tasks/:id`**
   - Method: `DELETE`
   - URL: `{{baseUrl}}/tasks/<PASTE_ID_HERE>`
   - Expect: `200 OK` with the deleted task object.
6. **GET `/tasks/:id` (Subsequent check)**
   - Method: `GET`
   - URL: `{{baseUrl}}/tasks/<PASTE_ID_HERE>`
   - Expect: `404 Not Found`.

### Step 3: Validation & Error Case Testing
- **Test Whitespace Title:** `POST /tasks` with `{"title": "   "}` -> Expect `400 Bad Request`.
- **Test Invalid Priority:** `POST /tasks` with `{"title": "Test", "priority": "critical"}` -> Expect `400 Bad Request`.
- **Test Invalid ObjectId:** `GET /tasks/non-hex-id` -> Expect `400 Bad Request`.
- **Test Non-Existent ObjectId:** `GET /tasks/507f1f77bcf86cd799439011` -> Expect `404 Not Found`.
- **Test Missing Content-Type Header:** `POST /tasks` with `Content-Type: text/plain` -> Expect `415 Unsupported Media Type`.
- **Test Malformed JSON:** `POST /tasks` with body `{"title": "incomplete` -> Expect `400 Bad Request` without leaking stack trace.

---

## 🔍 MongoDB Compass Verification Guide

To visually inspect database records and confirm persistence:

1. **Open MongoDB Compass.**
2. In the **New Connection** input, enter:
   ```text
   mongodb://127.0.0.1:27017
   ```
3. Click **Connect**.
4. In the left navigation sidebar, find and click on the database named **`taskmanager_db`**.
5. Click on the **`tasks`** collection.
6. Verify:
   - Each created task is stored as a BSON Document.
   - `_id` is stored as `ObjectId("...")`.
   - Fields `title`, `description`, `completed`, `priority`, and `createdAt` match schema definitions.
7. **Verify Persistence Across Server Restarts:**
   - Stop the Node.js server (`Ctrl+C` in terminal).
   - Refresh MongoDB Compass — note that all documents remain intact.
   - Restart the server (`npm start`) — fetch `GET /tasks` in Postman to confirm data persists seamlessly.
