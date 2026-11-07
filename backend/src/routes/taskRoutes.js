import { Router } from 'express';
import { createTask, deleteTask, listTasks, toggleTask, updateTask } from '../controllers/taskController.js';

export const taskRouter = Router();

taskRouter.route('/').get(listTasks).post(createTask);
taskRouter.patch('/:id/toggle', toggleTask);
taskRouter.route('/:id').put(updateTask).delete(deleteTask);
