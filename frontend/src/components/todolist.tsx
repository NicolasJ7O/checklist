import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Category {
    id: number;
    name: string;
    priority: number;
}

interface Task {
    _id?: string; // MongoDB utiliza _id
    title: string;
    description?: string;
    categoryId: number;
    completed: boolean;
}

const TodoList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [newTask, setNewTask] = useState({ title: '', description: '', categoryId: 0 });
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
        fetchTasks();
    }, []);

    // Obtener categorías desde el backend
    const fetchCategories = async () => {
        try {
            const res = await axios.get<Category[]>('http://localhost:5000/api/categories');
            setCategories(res.data);
            // Si no se ha seleccionado ninguna categoría para la tarea nueva, se asigna la primera
            if (res.data.length && newTask.categoryId === 0) {
                setNewTask(prev => ({ ...prev, categoryId: res.data[0].id }));
            }
        } catch (err) {
            setError('Error al cargar las categorías');
            console.error(err);
        }
    };

    // Obtener tareas desde el backend
    const fetchTasks = async () => {
        try {
            const res = await axios.get<Task[]>('http://localhost:5000/api/tasks');
            setTasks(res.data);
        } catch (err) {
            setError('Error al cargar las tareas');
            console.error(err);
        }
    };

    // Crear una nueva tarea
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post<Task>('http://localhost:5000/api/tasks', newTask);
            setTasks([...tasks, res.data]);
            setNewTask({ title: '', description: '', categoryId: newTask.categoryId });
        } catch (err) {
            setError('Error al agregar la tarea');
            console.error(err);
        }
    };

    // Eliminar una tarea
    const handleDelete = async (id: string | undefined) => {
        if (!id) return;
        try {
            await axios.delete(`http://localhost:5000/api/tasks/${id}`);
            setTasks(tasks.filter(task => task._id !== id));
        } catch (err) {
            setError('Error al eliminar la tarea');
            console.error(err);
        }
    };

    // Preparar la edición de una tarea
    const handleEditClick = (task: Task) => {
        setEditingTask(task);
    };

    // Manejar cambios en el formulario de edición
    const handleEditChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        if (editingTask) {
            setEditingTask({
                ...editingTask,
                [e.target.name]: e.target.name === 'categoryId' ? parseInt(e.target.value) : e.target.value,
            });
        }
    };

    // Enviar la actualización de la tarea
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTask || !editingTask._id) return;
        try {
            const res = await axios.put<Task>(`http://localhost:5000/api/tasks/${editingTask._id}`, editingTask);
            setTasks(tasks.map(task => (task._id === editingTask._id ? res.data : task)));
            setEditingTask(null);
        } catch (err) {
            setError('Error al actualizar la tarea');
            console.error(err);
        }
    };

    // Cancelar la edición
    const handleCancelEdit = () => {
        setEditingTask(null);
    };

    return (
        <div>
            <h1>To-Do List</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Formulario para crear nueva tarea */}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Título de la tarea"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    required
                />
                <textarea
                    placeholder="Descripción (opcional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
                <select
                    name="categoryId"
                    value={newTask.categoryId}
                    onChange={(e) => setNewTask({ ...newTask, categoryId: parseInt(e.target.value) })}
                >
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name} (Prioridad: {category.priority})
                        </option>
                    ))}
                </select>
                <button type="submit">Agregar Tarea</button>
            </form>

            <h2>Lista de Tareas</h2>
            <ul>
                {tasks.map(task => {
                    const category = categories.find(c => c.id === task.categoryId);
                    return (
                        <li key={task._id || task.title}>
                            {editingTask && editingTask._id === task._id ? (
                                // Formulario de edición de tarea
                                <form onSubmit={handleEditSubmit}>
                                    <input
                                        type="text"
                                        name="title"
                                        value={editingTask.title}
                                        onChange={handleEditChange}
                                        required
                                    />
                                    <textarea
                                        name="description"
                                        value={editingTask.description}
                                        onChange={handleEditChange}
                                    />
                                    <select
                                        name="categoryId"
                                        value={editingTask.categoryId}
                                        onChange={handleEditChange}
                                    >
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name} (Prioridad: {category.priority})
                                            </option>
                                        ))}
                                    </select>
                                    <button type="submit">Guardar</button>
                                    <button type="button" onClick={handleCancelEdit}>Cancelar</button>
                                </form>
                            ) : (
                                // Visualización normal de la tarea
                                <div>
                                    <strong>{task.title}</strong>
                                    {task.description && <p>{task.description}</p>}
                                    <span style={{ marginLeft: '10px', fontStyle: 'italic' }}>
                                        [{category ? category.name : 'Sin categoría'}]
                                    </span>
                                    <button onClick={() => handleEditClick(task)}>Editar</button>
                                    <button onClick={() => handleDelete(task._id)}>Eliminar</button>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default TodoList;
