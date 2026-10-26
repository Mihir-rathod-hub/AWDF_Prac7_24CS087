/**
 * Task Service Module
 * Practical 6 & 7: Full Stack Integration + Authentication
 * 
 * Centralizes all HTTP CRUD requests between the React frontend
 * and the Express/Mongoose backend API via the Vite proxy (/api/tasks -> http://localhost:3000/tasks).
 * Automatically injects the JWT Bearer token into request headers and intercepts 401 Unauthorized errors.
 */

import { getToken, removeToken, triggerUnauthorized } from './authService';

const BASE_URL = '/api/tasks';

/**
 * Helper to build authorization headers with JWT
 */
function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Helper to process Fetch API responses and extract meaningful error messages.
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson) {
        if (errorJson.errors && typeof errorJson.errors === 'object') {
          const fieldErrors = Object.values(errorJson.errors).join(' ');
          errorDetail = errorJson.message
            ? `${errorJson.message} ${fieldErrors}`
            : fieldErrors;
        } else if (errorJson.message) {
          errorDetail = errorJson.message;
        }
      }
    } catch {
      // Non-JSON response body
    }

    // Intercept 401 Unauthorized (invalid or expired token)
    if (response.status === 401) {
      removeToken();
      triggerUnauthorized(errorDetail);
    }

    throw new Error(errorDetail);
  }

  // Handle 204 No Content or empty bodies
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return null;
}

/**
 * Helper to catch network-level failures (e.g. backend server offline).
 */
function handleNetworkError(err) {
  if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
    throw new Error(
      'Unable to connect to the backend server. Please make sure the Express/MongoDB server is running on http://localhost:3000.'
    );
  }
  throw err;
}

/**
 * Fetch all tasks owned by the authenticated user from MongoDB.
 * GET /tasks
 * @returns {Promise<Array>} Array of task objects
 */
export async function getTasks() {
  try {
    const response = await fetch(BASE_URL, {
      headers: {
        Accept: 'application/json',
        ...getAuthHeaders(),
      },
    });
    const result = await handleResponse(response);

    // Support both standardized API wrapper ({ success, data: [...] }) and raw array ([...])
    if (Array.isArray(result)) {
      return result;
    }
    if (result && Array.isArray(result.data)) {
      return result.data;
    }
    if (result && Array.isArray(result.tasks)) {
      return result.tasks;
    }
    return [];
  } catch (err) {
    handleNetworkError(err);
  }
}

/**
 * Create a new task in MongoDB associated with the authenticated user.
 * POST /tasks
 * @param {Object} taskData - { title: string, description?: string, completed?: boolean, priority?: string }
 * @returns {Promise<Object>} The created task document
 */
export async function createTask(taskData) {
  try {
    const payload = {
      title: taskData.title.trim(),
    };

    if (taskData.description !== undefined) {
      payload.description = taskData.description.trim();
    }

    if (taskData.completed !== undefined) {
      payload.completed = Boolean(taskData.completed);
    }

    if (taskData.priority !== undefined && taskData.priority) {
      payload.priority = taskData.priority.toLowerCase().trim();
    }

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const result = await handleResponse(response);

    // Support both { data: task }, { task: task }, and direct task return
    return result?.data || result?.task || result;
  } catch (err) {
    handleNetworkError(err);
  }
}

/**
 * Update an existing task in MongoDB owned by the authenticated user.
 * PUT /tasks/:id
 * @param {string} id - The MongoDB _id of the task
 * @param {Object} updateData - Partial or complete task fields to update
 * @returns {Promise<Object>} The updated task document
 */
export async function updateTask(id, updateData) {
  try {
    const payload = {};
    if (updateData.title !== undefined) {
      payload.title = updateData.title.trim();
    }
    if (updateData.description !== undefined) {
      payload.description = updateData.description.trim();
    }
    if (updateData.completed !== undefined) {
      payload.completed = Boolean(updateData.completed);
    }
    if (updateData.priority !== undefined && updateData.priority) {
      payload.priority = updateData.priority.toLowerCase().trim();
    }

    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const result = await handleResponse(response);

    return result?.data || result?.task || result;
  } catch (err) {
    handleNetworkError(err);
  }
}

/**
 * Delete a task from MongoDB owned by the authenticated user.
 * DELETE /tasks/:id
 * @param {string} id - The MongoDB _id of the task
 * @returns {Promise<Object>} Response confirmation
 */
export async function deleteTask(id) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        ...getAuthHeaders(),
      },
    });
    return await handleResponse(response);
  } catch (err) {
    handleNetworkError(err);
  }
}

export default {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
