# Advanced Web Development Frameworks - Practical 6: Full Stack Integration (React + Node.js + MongoDB)

A full-stack web application featuring an interactive **Task Manager** seamlessly integrated with an Express/Node.js REST API and a MongoDB database, wrapped in a developer portfolio built with React 19, Vite, React Router v7, and modern responsive CSS.

- **Frontend Repository**: [AWDF_Prac6_24CS087](https://github.com/Mihir-rathod-hub/AWDF_Prac6_24CS087.git)
- **Student Name**: Mihir Rathod
- **Student ID**: 24CS087
- **Course**: Advanced Web Development Frameworks (AWDF)

---

## Full-Stack Architecture

```
┌────────────────────────────────────────────────────────┐
│             React 19 Frontend (Vite)                   │
│             http://localhost:5173                      │
│  - TaskManager.jsx (State, Filters, Stats)             │
│  - TaskForm.jsx (Controlled Create / Edit Form)        │
│  - TaskItem.jsx (Status Toggle, Edit, Delete Actions)  │
│  - ConfirmModal.jsx (Accessible Deletion Confirmation) │
│  - Toast.jsx (Floating Success / Error Notifications)  │
│  - taskService.js (Centralized API HTTP Client)        │
└───────────────────────────┬────────────────────────────┘
                            │
              Vite Dev Proxy: /api/* -> :3000/*
                            │
┌───────────────────────────▼────────────────────────────┐
│              Express.js REST API Server                │
│              http://localhost:3000                     │
│  - app.js (Express Application & Middlewares)          │
│  - routes/taskRoutes.js (CRUD Route Handlers)          │
└───────────────────────────┬────────────────────────────┘
                            │ Mongoose ODM
┌───────────────────────────▼────────────────────────────┐
│                  MongoDB Database                      │
│  - Collection: tasks                                   │
│  - Schema: { title, description, completed, createdAt }│
└────────────────────────────────────────────────────────┘
```

---

## Features Implemented

### 1. Complete CRUD Functionality
- **Read (GET `/tasks`)**: Loads all stored tasks from MongoDB on initial render. Tasks persist across browser refreshes because MongoDB is the source of truth.
- **Create (POST `/tasks`)**: Adds new tasks with a required title and optional description via `TaskForm.jsx`.
- **Update (PUT `/tasks/:id`)**:
  - Allows editing task title and description with an active "Edit Mode" state in the form.
  - Toggles task completion (`completed: true / false`) directly from each task card.
- **Delete (DELETE `/tasks/:id`)**: Prompts user confirmation via an accessible `ConfirmModal.jsx` dialog before permanently deleting a task.

### 2. Live Filters, Search & Summary Metrics
- **Dynamic Status Filters**: Filter task list by `All`, `Pending`, or `Completed` with real-time count badges.
- **Instant Search**: Search tasks case-insensitively by title or description.
- **Summary Metrics**: Real-time counter cards showing Total Tasks, Pending Tasks, and Completed Tasks.

### 3. User Feedback & Loading States
- **Loading Indicators**: Renders accessible `Spinner.jsx` during data fetching and inline mini-spinners on action buttons.
- **Error Handling**: Displays `ErrorMessage.jsx` with a retry action if the backend server is unreachable.
- **Toast Notifications**: Floating `Toast.jsx` alerts for instant feedback on successful creates, updates, status toggles, and deletions.

### 4. Vite Development Proxy
- Configured in `vite.config.js` to proxy `/api` requests to `http://localhost:3000`.
- Eliminates CORS issues in local development without needing to alter the backend's CORS policies.

### 5. UI/UX & Theming
- Unified Bluish-Purple palette with dark/light mode toggle maintained from earlier practicals.
- Fully responsive across mobile, tablet, and desktop viewports.

---

## API Endpoints Reference

The backend Express application exposes the following REST endpoints on `/tasks`:

| HTTP Method | Route | Description | Request Body | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/tasks` | Retrieve all tasks from MongoDB | None | `200 OK` (Array of tasks) |
| **POST** | `/tasks` | Create a new task | `{ title: String, description?: String, completed?: Boolean }` | `201 Created` (`{ message, task }`) |
| **PUT** | `/tasks/:id` | Update an existing task | `{ title?: String, description?: String, completed?: Boolean }` | `200 OK` (`{ message, task }`) |
| **DELETE** | `/tasks/:id` | Delete a task by MongoDB `_id` | None | `200 OK` (`{ message }`) |

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm
- MongoDB instance (MongoDB Atlas connection string or local MongoDB running on `mongodb://localhost:27017`)

---

### Step 1: Start the Backend (Practical 5)

1. Open a terminal and navigate to your Practical 5 backend project directory:
   ```bash
   cd C:\Awdf_Lab\Practical-5
   ```
2. Verify that your MongoDB connection string is set in `app.js` (or `.env`):
   ```javascript
   mongoose.connect('mongodb://localhost:27017/taskmanager'); // or Atlas URI
   ```
3. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
4. Start the backend server:
   ```bash
   node app.js
   ```
   *The server will start listening on `http://localhost:3000`.*

---

### Step 2: Start the Frontend (Practical 6)

1. Open a second terminal and navigate to the frontend project:
   ```bash
   cd C:\AWDF_Practicals
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and visit:
   ```
   http://localhost:5173/
   ```

---

### Production Build & Code Quality

- **Linting**:
  ```bash
  npm run lint
  ```
- **Production Build**:
  ```bash
  npm run build
  ```
- **Preview Production Build**:
  ```bash
  npm run preview
  ```

---

## Project Structure

```
C:\AWDF_Practicals/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── About.jsx            # About section
│   │   ├── ConfirmModal.jsx     # Deletion confirmation modal
│   │   ├── Contact.jsx          # Contact page with controlled form
│   │   ├── ErrorMessage.jsx     # Reusable error alert with retry
│   │   ├── Footer.jsx           # Application footer
│   │   ├── Header.jsx           # Hero header banner
│   │   ├── Home.jsx             # Home page layout
│   │   ├── NavBar.jsx           # Navigation bar with theme toggle
│   │   ├── NotFound.jsx         # 404 Not Found route fallback
│   │   ├── Projects.jsx         # Legacy GitHub repos component
│   │   ├── RepoList.jsx         # Legacy repository list card renderer
│   │   ├── Skills.jsx           # Technical skills grid
│   │   ├── Spinner.jsx          # Reusable loading spinner
│   │   ├── TaskForm.jsx         # Create & edit task form
│   │   ├── TaskItem.jsx         # Single task card with actions
│   │   ├── TaskManager.jsx      # Main Task Manager dashboard
│   │   └── Toast.jsx            # Floating feedback notifications
│   ├── services/
│   │   └── taskService.js       # Centralized Fetch API client for CRUD
│   ├── App.css                  # Comprehensive design system & styles
│   ├── App.jsx                  # Root routes & theme state
│   ├── index.css                # CSS variables & typography reset
│   └── main.jsx                 # Vite React entry point
├── index.html                   # HTML entry point with Plus Jakarta Sans
├── package.json                 # Project configuration & scripts
├── vite.config.js               # Vite config with backend proxy (/api)
└── README.md                    # Practical documentation & setup guide
```

---

## Author
- **Mihir Rathod** (24CS087)
- **Email**: [24cs087@charusat.edu.in](mailto:24cs087@charusat.edu.in)
- **Institution**: Charotar University of Science and Technology (CHARUSAT)
