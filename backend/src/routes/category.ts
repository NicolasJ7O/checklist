import { Router, Request, Response } from 'express';
import { Category } from '../models/Category';

const router = Router();

// Datos en memoria para demo
let categories: Category[] = [
  { id: 1, name: 'Alta', priority: 3 },
  { id: 2, name: 'Media', priority: 2 },
  { id: 3, name: 'Baja', priority: 1 }
];

router.get('/', (req: Request, res: Response) => {
  res.json(categories);
});

router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const category = categories.find(c => c.id === id);
  if (!category) {
    res.status(404).json({ message: 'Categoría no encontrada' });
    return;
  }
  res.json(category);
});

router.post('/', (req: Request, res: Response) => {
  const newCategory: Category = req.body;
  newCategory.id = categories.length > 0 ? categories[categories.length - 1].id + 1 : 1;
  categories.push(newCategory);
  res.status(201).json(newCategory);
});

router.put('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Categoría no encontrada' });
    return;
  }
  categories[index] = { ...categories[index], ...req.body };
  res.json(categories[index]);
});

router.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Categoría no encontrada' });
    return;
  }
  const deleted = categories.splice(index, 1);
  res.json(deleted[0]);
});

export default router;
