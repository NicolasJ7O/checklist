import { Router, Request, Response, NextFunction } from 'express';
import TaskModel, { ITask } from '../models/taskModel';

const router = Router();

// Obtener todas las tasks
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks: ITask[] = await TaskModel.find();
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Obtener una task por id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: 'Task no encontrada' });
      return;
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// Crear una nueva task
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, categoryId } = req.body;
    const newTask: ITask = new TaskModel({
      title,
      description,
      categoryId,
      completed: false,
    });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    next(error);
  }
});

// Actualizar una task
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedTask = await TaskModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTask) {
      res.status(404).json({ message: 'Task no encontrada' });
      return;
    }
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
});

// Eliminar una task
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedTask = await TaskModel.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      res.status(404).json({ message: 'Task no encontrada' });
      return;
    }
    res.json(deletedTask);
  } catch (error) {
    next(error);
  }
});

export default router;
