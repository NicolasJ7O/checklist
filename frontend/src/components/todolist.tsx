import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    ListGroup,
    Modal,
    Alert
} from 'react-bootstrap';

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
    // Estados
    const [tasks, setTasks] = useState<Task[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [newTask, setNewTask] = useState({ title: '', description: '', categoryId: 0 });
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [error, setError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

    // Cargar categorías y tareas al montar el componente
    useEffect(() => {
        fetchCategories();
        fetchTasks();
    }, []);

    // Obtener categorías desde el backend
    const fetchCategories = async () => {
        try {
            const res = await axios.get<Category[]>('http://localhost:5000/api/categories');
            setCategories(res.data);
            // Si no se ha seleccionado ninguna categoría para la nueva tarea, asignamos la primera
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

    // Agregar tarea nueva
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;
        try {
            const res = await axios.post<Task>('http://localhost:5000/api/tasks', newTask);
            setTasks([...tasks, res.data]);
            setNewTask({ title: '', description: '', categoryId: newTask.categoryId });
        } catch (err) {
            setError('Error al agregar la tarea');
            console.error(err);
        }
    };

    // Marcar tarea como completada (toggle)
    const toggleCompleted = async (task: Task) => {
        try {
            const updatedTask = { ...task, completed: !task.completed };
            const res = await axios.put<Task>(`http://localhost:5000/api/tasks/${task._id}`, updatedTask);
            setTasks(tasks.map(t => (t._id === task._id ? res.data : t)));
        } catch (err) {
            setError('Error al actualizar la tarea');
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
                [e.target.name]:
                    e.target.name === 'categoryId' ? parseInt(e.target.value) : e.target.value,
            });
        }
    };

    // Enviar actualización de la tarea
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

    // Cancelar edición
    const handleCancelEdit = () => {
        setEditingTask(null);
    };

    // Preparar eliminación (mostrar modal)
    const handleDeleteClick = (task: Task) => {
        setTaskToDelete(task);
        setShowDeleteModal(true);
    };

    // Confirmar eliminación
    const confirmDelete = async () => {
        if (!taskToDelete || !taskToDelete._id) return;
        try {
            await axios.delete(`http://localhost:5000/api/tasks/${taskToDelete._id}`);
            setTasks(tasks.filter(t => t._id !== taskToDelete._id));
        } catch (err) {
            setError('Error al eliminar la tarea');
            console.error(err);
        } finally {
            setShowDeleteModal(false);
            setTaskToDelete(null);
        }
    };

    // Cancelar eliminación
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setTaskToDelete(null);
    };

    return (
        <Container className="mt-5">
            {/* Título */}
            <Row className="mb-4">
                <Col>
                    <h1 className="text-center text-warning">To-Do List</h1>
                </Col>
            </Row>

            {/* Mensaje de error */}
            {error && (
                <Row className="mb-3">
                    <Col>
                        <Alert variant="danger">{error}</Alert>
                    </Col>
                </Row>
            )}

            {/* Formulario para agregar tarea: horizontal en md y vertical en móviles */}
            <Row className="justify-content-center mb-4">
                <Col md={10}>
                    <Form onSubmit={handleSubmit} className="d-flex flex-column flex-md-row align-items-center">
                        <Form.Control
                            type="text"
                            placeholder="Nombre de la tarea"
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            required
                            className="me-2 mb-2"
                            style={{ flex: '2' }}
                        />
                        <Form.Control
                            as="textarea"
                            placeholder="Descripción (opcional)"
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            className="me-2 mb-2"
                            style={{ flex: '3', resize: 'vertical', maxHeight: '100px' }}
                        />
                        <Form.Select
                            name="categoryId"
                            value={newTask.categoryId}
                            onChange={(e) => setNewTask({ ...newTask, categoryId: parseInt(e.target.value) })}
                            className="me-2 mb-2"
                            style={{ flex: '1' }}
                        >
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name} (Prioridad: {category.priority})
                                </option>
                            ))}
                        </Form.Select>
                        <Button variant="primary" type="submit" className="mb-2" style={{ flex: '0 0 auto' }}>
                            Agregar
                        </Button>
                    </Form>
                </Col>
            </Row>

            {/* Lista de tareas */}
            <Row>
                <Col md={{ span: 10, offset: 1 }}>
                    <h2 className="mb-3">Lista de Tareas</h2>
                    <ListGroup>
                        {tasks.map(task => {
                            const category = categories.find(c => c.id === task.categoryId);
                            return (
                                <ListGroup.Item
                                    key={task._id || task.title}
                                    className="d-flex justify-content-between align-items-center"
                                >
                                    {editingTask && editingTask._id === task._id ? (
                                        // Formulario de edición de tarea
                                        <Form onSubmit={handleEditSubmit} className="w-100">
                                            <Row className="align-items-center">
                                                <Col md={3}>
                                                    <Form.Control
                                                        type="text"
                                                        name="title"
                                                        value={editingTask.title}
                                                        onChange={handleEditChange}
                                                        required
                                                    />
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Control
                                                        as="textarea"
                                                        name="description"
                                                        value={editingTask.description}
                                                        onChange={handleEditChange}
                                                        placeholder="Descripción (opcional)"
                                                        style={{ resize: 'vertical', maxHeight: '80px' }}
                                                    />
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Select
                                                        name="categoryId"
                                                        value={editingTask.categoryId}
                                                        onChange={handleEditChange}
                                                    >
                                                        {categories.map(category => (
                                                            <option key={category.id} value={category.id}>
                                                                {category.name} (Prioridad: {category.priority})
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </Col>
                                                <Col md={3} className="d-flex justify-content-end">
                                                    <Button variant="success" type="submit" className="me-2">
                                                        Guardar
                                                    </Button>
                                                    <Button variant="secondary" type="button" onClick={handleCancelEdit}>
                                                        Cancelar
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Form>
                                    ) : (
                                        // Visualización normal de la tarea
                                        <div className="w-100 d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={task.completed}
                                                    onChange={() => toggleCompleted(task)}
                                                    className="me-2"
                                                />
                                                <div>
                                                    <h5
                                                        className="mb-1"
                                                        style={{ textDecoration: task.completed ? 'line-through' : 'none' }}
                                                    >
                                                        {task.title}
                                                    </h5>
                                                    {task.description && (
                                                        <p
                                                            className="mb-1"
                                                            style={{ textDecoration: task.completed ? 'line-through' : 'none' }}
                                                        >
                                                            {task.description}
                                                        </p>
                                                    )}
                                                    <small className="text-muted">
                                                        [{category ? category.name : 'Sin categoría'}]
                                                    </small>
                                                </div>
                                            </div>
                                            <div>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleEditClick(task)}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(task)}
                                                >
                                                    Eliminar
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </ListGroup.Item>
                            );
                        })}
                    </ListGroup>
                </Col>
            </Row>

            {/* Modal de confirmación para eliminar tarea */}
            <Modal show={showDeleteModal} onHide={cancelDelete} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro de eliminar la tarea "{taskToDelete?.title}"?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelDelete}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default TodoList;
