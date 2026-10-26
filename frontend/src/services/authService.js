/**
 * Authentication Service Module
 * Practical 7: Authentication and Middleware Pipeline
 * 
 * Centralizes all Auth API requests (/api/auth -> http://localhost:3000/auth)
 * and manages JWT token storage in localStorage.
 */

const AUTH_BASE = '/api/auth';
const TOKEN_KEY = 'awdf_auth_token';

/**
 * Retrieve the stored JWT token from localStorage
 */
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Store the JWT token in localStorage
 */
export function setToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // LocalStorage write failed (e.g. private mode quota)
  }
}

/**
 * Remove the stored JWT token from localStorage
 */
export function removeToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore error
  }
}

/**
 * Helper to trigger global unauthorized event for 401 handling
 */
export function triggerUnauthorized(message = 'Your session has expired or is unauthorized. Please log in again.') {
  removeToken();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('auth:unauthorized', {
        detail: { message },
      })
    );
  }
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

    if (response.status === 401) {
      triggerUnauthorized(errorDetail);
    }

    throw new Error(errorDetail);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return null;
}

/**
 * Helper to catch network-level failures
 */
function handleNetworkError(err) {
  if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
    throw new Error(
      'Unable to connect to the backend server. Please verify the Express/MongoDB server is running on http://localhost:3000.'
    );
  }
  throw err;
}

/**
 * Register a new user account
 * POST /auth/register
 * @param {Object} credentials - { email, password, name? }
 * @returns {Promise<Object>} { token, user, message }
 */
export async function register({ email, password, name }) {
  try {
    const payload = {
      email: email.trim(),
      password,
      name: name ? name.trim() : '',
    };

    const response = await fetch(`${AUTH_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await handleResponse(response);
    const token = result?.token;
    const user = result?.data || result?.user;

    if (token) {
      setToken(token);
    }

    return { token, user, message: result?.message || 'Registered successfully' };
  } catch (err) {
    handleNetworkError(err);
  }
}

/**
 * Authenticate existing user
 * POST /auth/login
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} { token, user, message }
 */
export async function login({ email, password }) {
  try {
    const payload = {
      email: email.trim(),
      password,
    };

    const response = await fetch(`${AUTH_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await handleResponse(response);
    const token = result?.token;
    const user = result?.data || result?.user;

    if (token) {
      setToken(token);
    }

    return { token, user, message: result?.message || 'Logged in successfully' };
  } catch (err) {
    handleNetworkError(err);
  }
}

/**
 * Fetch current authenticated user's profile using JWT
 * GET /auth/me
 * @param {string} [authToken]
 * @returns {Promise<Object>} User profile object
 */
export async function getMe(authToken) {
  const token = authToken || getToken();
  if (!token) {
    throw new Error('No authentication token found.');
  }

  try {
    const response = await fetch(`${AUTH_BASE}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    const result = await handleResponse(response);
    return result?.data || result?.user || result;
  } catch (err) {
    handleNetworkError(err);
  }
}

/**
 * Log out user by clearing the stored token
 */
export function logout() {
  removeToken();
}

export default {
  getToken,
  setToken,
  removeToken,
  triggerUnauthorized,
  register,
  login,
  getMe,
  logout,
};
