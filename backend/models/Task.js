const mongoose = require('mongoose');

/**
 * Task Mongoose Schema
 * Practical 6 & 7: Task Schema with User Ownership Reference
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      validate: {
        validator: function (val) {
          return typeof val === 'string' && val.trim().length > 0;
        },
        message: 'Title cannot be empty or contain only whitespace'
      }
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    completed: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid priority. Allowed values: low, medium, high'
      },
      default: 'medium',
      lowercase: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    }
  },
  {
    versionKey: false
  }
);

/**
 * Pre-save hook to trim whitespace from the title
 * and ensure whitespace-only titles fail validation.
 * Compatible with Mongoose 9 middleware syntax.
 */
taskSchema.pre('save', function () {
  if (typeof this.title === 'string') {
    this.title = this.title.trim();
  }
  if (!this.title || this.title.length === 0) {
    throw new Error('Title cannot be empty or contain only whitespace');
  }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
