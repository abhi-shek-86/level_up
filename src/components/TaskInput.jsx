export default function TaskInput({ tasks, setTasks }) {
  // Ensure tasks is always an array
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const addTask = () => {
    if (safeTasks.length < 5) setTasks([...safeTasks, '']);
  };

  const updateTask = (i, value) => {
    const newTasks = [...safeTasks];
    newTasks[i] = value;
    setTasks(newTasks);
  };

  return (
    <div className="task-input-container">
      <h3>Add Tasks</h3>
      <div className="task-input-list">
        {safeTasks.map((task, i) => (
          <input
            key={i}
            value={task}
            onChange={(e) => updateTask(i, e.target.value)}
            placeholder={`Task ${i + 1}`}
            className="task-input-field"
          />
        ))}
      </div>
      <button type="button" className="add-task-btn" onClick={addTask}>Add Task</button>
    </div>
  );
}
