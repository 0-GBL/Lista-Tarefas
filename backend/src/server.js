import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import { taskRouter } from './routes/taskRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));
app.use('/api/tasks', taskRouter);

app.use((error, _req, res, _next) => {
  if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
  if (error.name === 'CastError') return res.status(400).json({ message: 'Identificador inválido.' });
  console.error(error);
  res.status(500).json({ message: 'Ocorreu um erro inesperado.' });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => console.log(`API disponível em http://localhost:${port}`));
  })
  .catch((error) => {
    console.error('Não foi possível conectar ao MongoDB:', error.message);
    process.exit(1);
  });
