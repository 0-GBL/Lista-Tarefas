import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    scheduledAt: { type: Date, required: true },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

taskSchema.index({ scheduledAt: 1, completed: 1 });

export const Task = mongoose.model('Task', taskSchema);
