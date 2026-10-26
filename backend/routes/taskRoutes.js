const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Validate MongoDB ObjectId format (24-character hexadecimal string)
 */
function isValidObjectId(id) {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id.trim());
}

// Protect all task endpoints with authentication middleware
router.use(auth);

/**
 * GET /tasks
 * Retrieve all tasks owned by the authenticated user
 */
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /tasks/:id
 * Retrieve a specific task owned by the authenticated user.
 * Returns 404 for missing, unowned, or other users' tasks to prevent ID enumeration.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid task ID format: '${id}'. Must be a 24-character hexadecimal ObjectId.`
      });
    }

    const task = await Task.findOne({ _id: id, user: req.user._id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with ID '${id}' not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /tasks
 * Create a new task in MongoDB associated with the authenticated user
 */
router.post('/', async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body || {};

    // Validate title presence and type
    if (title === undefined || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: {
          title: 'Title is required and cannot be empty or contain only whitespace.'
        }
      });
    }

    const taskPayload = {
      title: title.trim(),
      user: req.user._id
    };

    if (description !== undefined) {
      if (typeof description !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Validation failed.',
          errors: {
            description: 'Description must be a string.'
          }
        });
      }
      taskPayload.description = description.trim();
    }

    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Validation failed.',
          errors: {
            completed: 'Completed must be a boolean (true or false).'
          }
        });
      }
      taskPayload.completed = completed;
    }

    if (priority !== undefined) {
      if (typeof priority !== 'string' || !['low', 'medium', 'high'].includes(priority.toLowerCase().trim())) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed.',
          errors: {
            priority: `'${priority}' is not a valid priority. Allowed values: low, medium, high.`
          }
        });
      }
      taskPayload.priority = priority.toLowerCase().trim();
    }

    const newTask = await Task.create(taskPayload);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: newTask
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /tasks/:id
 * Update an existing task owned by the authenticated user.
 * Returns 404 for missing, unowned, or other users' tasks.
 */
router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid task ID format: '${id}'. Must be a 24-character hexadecimal ObjectId.`
      });
    }

    // Verify task existence and ownership
    const task = await Task.findOne({ _id: id, user: req.user._id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with ID '${id}' not found.`
      });
    }

    const { title, description, completed, priority } = req.body || {};

    // Ensure at least one update field is provided
    if (title === undefined && description === undefined && completed === undefined && priority === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one field ('title', 'description', 'completed', 'priority') must be provided to update."
      });
    }

    const updatePayload = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed.',
          errors: {
            title: 'Title cannot be empty or contain only whitespace.'
          }
        });
      }
      updatePayload.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Validation failed.',
          errors: {
            description: 'Description must be a string.'
          }
        });
      }
      updatePayload.description = description.trim();
    }

    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Validation failed.',
          errors: {
            completed: 'Completed must be a boolean (true or false).'
          }
        });
      }
      updatePayload.completed = completed;
    }

    if (priority !== undefined) {
      if (typeof priority !== 'string' || !['low', 'medium', 'high'].includes(priority.toLowerCase().trim())) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed.',
          errors: {
            priority: `'${priority}' is not a valid priority. Allowed values: low, medium, high.`
          }
        });
      }
      updatePayload.priority = priority.toLowerCase().trim();
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, user: req.user._id },
      updatePayload,
      { new: true, returnDocument: 'after', runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /tasks/:id
 * Delete an existing task owned by the authenticated user.
 * Returns 404 for missing, unowned, or other users' tasks.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid task ID format: '${id}'. Must be a 24-character hexadecimal ObjectId.`
      });
    }

    const deletedTask = await Task.findOneAndDelete({ _id: id, user: req.user._id });
    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: `Task with ID '${id}' not found.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
      data: deletedTask
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
