const { useState, useEffect, useRef } = React;

function ToDoScreen({ currentUser }) {
    const [tasks, setTasks] = useState([]);
    const [newTaskContent, setNewTaskContent] = useState('');
    
    const [draggedItem, setDraggedItem] = useState(null);

    // FETCH TASKS
    useEffect(() => {
        if (!currentUser) return;
        fetch('/api/todos', { headers: { 'user-email': currentUser.email } })
            .then(res => res.json())
            .then(data => setTasks(data));
    }, [currentUser]);

    // ADD TASK
    const handleAddTask = async () => {
        if (!newTaskContent.trim()) return;

        const res = await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userEmail: currentUser.email, 
                content: newTaskContent 
            })
        });
        const result = await res.json();
        if (result.success) {
            setTasks([...tasks, result.task]);
            setNewTaskContent('');
        }
    };

    // TOGGLE TASK
    const handleToggleTask = async (task) => {
        const updatedTasks = tasks.map(t => 
            t._id === task._id ? { ...t, isCompleted: !t.isCompleted } : t
        );
        setTasks(updatedTasks);

        await fetch(`/api/todos/${task._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isCompleted: !task.isCompleted })
        });
    };

    // DELETE TASK
    const handleDeleteTask = async (taskId) => {
        setTasks(tasks.filter(t => t._id !== taskId));
        await fetch(`/api/todos/${taskId}`, { method: 'DELETE' });
    };

    // DRAG AND DROP LOGIC
    const handleDragStart = (e, index) => {
        setDraggedItem(tasks[index]);
        e.dataTransfer.effectAllowed = "move";
        e.target.style.opacity = '0.5';
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggedItem(null);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        const draggedOverItem = tasks[index];
        if (draggedItem === draggedOverItem) return;

        let newTasks = tasks.filter(item => item !== draggedItem);
        newTasks.splice(index, 0, draggedItem);
        setTasks(newTasks);
    };

    const handleDrop = async () => {
        const taskIds = tasks.map(t => t._id);
        await fetch('/api/todos/reorder', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskIds })
        });
    };

    const activeTasks = tasks.filter(t => !t.isCompleted);
    const completedTasks = tasks.filter(t => t.isCompleted);

    return (
        <div className="content-area" style={{
            padding: '40px', 
            maxWidth: '800px',
            margin: '0 auto', 
            width: '100%', 
            boxSizing: 'border-box'
        }}>
            <div style={{marginBottom: '30px'}}>
                <h1 style={{fontSize: '24px', fontWeight: '600', marginBottom: '8px'}}>To-Do</h1>
                <p style={{color: '#6B7280', fontSize: '14px'}}>Manage your tasks and stay productive</p>
            </div>

            <div className="todo-input-container">
                <input 
                    className="todo-input" 
                    placeholder="Add a new task..." 
                    value={newTaskContent}
                    onChange={(e) => setNewTaskContent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <button className="todo-add-btn" onClick={handleAddTask}>+ Add</button>
            </div>

            <div className="task-section">
                <h3 className="section-title">Active Tasks ({activeTasks.length})</h3>
                <div className="task-list">
                    {activeTasks.map((task, index) => {
                        const realIndex = tasks.indexOf(task);
                        return (
                            <div 
                                key={task._id} 
                                className="task-item"
                                draggable
                                onDragStart={(e) => handleDragStart(e, realIndex)}
                                onDragOver={(e) => handleDragOver(e, realIndex)}
                                onDragEnd={handleDragEnd}
                                onDrop={handleDrop}
                            >
                                <div className="drag-handle" style={{marginRight:'10px', cursor:'grab', color:'#D1D5DB'}}>
                                    <i className="ph-bold ph-dots-six-vertical"></i>
                                </div>
                                <div className="checkbox-wrapper" onClick={() => handleToggleTask(task)}>
                                    <div className="custom-checkbox"></div>
                                </div>
                                <span className="task-text">{task.content}</span>
                                <i className="ph ph-trash task-delete" onClick={() => handleDeleteTask(task._id)}></i>
                            </div>
                        );
                    })}
                    {activeTasks.length === 0 && <div className="empty-state">No active tasks</div>}
                </div>
            </div>

            <div className="task-section">
                <h3 className="section-title">Completed ({completedTasks.length})</h3>
                <div className="task-list">
                    {completedTasks.map(task => (
                        <div key={task._id} className="task-item completed">
                            <div className="checkbox-wrapper" onClick={() => handleToggleTask(task)}>
                                <div className="custom-checkbox checked"><i className="ph-bold ph-check"></i></div>
                            </div>
                            <span className="task-text">{task.content}</span>
                            <i className="ph ph-trash task-delete" onClick={() => handleDeleteTask(task._id)}></i>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}