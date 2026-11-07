import { Task } from '../models/Task.js';

const taskFields = ['title', 'description', 'scheduledAt', 'completed'];

function pickTaskFields(body) {
  return Object.fromEntries(
    taskFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]])
  );
}

export async function listTasks(req, res) {
  const filter = {};
  if (req.query.status === 'completed') filter.completed = true;
  if (req.query.status === 'pending') filter.completed = false;
  const tasks = await Task.find(filter).sort({ completed: 1, scheduledAt: 1 });
  res.json(tasks);
}

export async function createTask(req, res) {
  const task = await Task.create(pickTaskFields(req.body));
  res.status(201).json(task);
}

export async function updateTask(req, res) {
  const task = await Task.findByIdAndUpdate(req.params.id, pickTaskFields(req.body), {
    new: true,
    runValidators: true
  });
  if (!task) return res.status(404).json({ message: 'Tarefa não encontrada.' });
  res.json(task);
}

export async function toggleTask(req, res) {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Tarefa não encontrada.' });
  task.completed = !task.completed;
  await task.save();
  res.json(task);
}

export async function deleteTask(req, res) {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ message: 'Tarefa não encontrada.' });
  res.status(204).send();
}
