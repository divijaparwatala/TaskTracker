import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import './App.css'

const apiUrl = import.meta.env.VITE_API_URL || 'https://tasktracker-zw9r.onrender.com/api/tasks'
const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('createdAt')
  const [isEditing, setIsEditing] = useState(false)
  const [activeTaskId, setActiveTaskId] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'pending',
    dueDate: '',
  })

  const loadTasks = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(apiUrl, {
        params: { status: filter },
      })
      setTasks(response.data)
    } catch (err) {
      setError('Unable to load tasks. Check your backend connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [filter])

  const filteredTasks = useMemo(() => {
    const list = [...tasks]
    if (sort === 'dueDate') {
      return list.sort((a, b) => {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      })
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [tasks, sort])

  const resetForm = () => {
    setIsEditing(false)
    setActiveTaskId(null)
    setForm({ title: '', description: '', status: 'pending', dueDate: '' })
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const showMessage = (text) => {
    setMessage(text)
    setTimeout(() => setMessage(''), 3000)
  }

  const submitForm = async (event) => {
    event.preventDefault()
    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }
    if (form.title.trim().length > 100) {
      setError('Title cannot exceed 100 characters.')
      return
    }

    setLoading(true)
    setError('')
    try {
      if (isEditing && activeTaskId) {
        await axios.put(`${apiUrl}/${activeTaskId}`, {
          ...form,
          title: form.title.trim(),
        })
        showMessage('Task updated successfully.')
      } else {
        await axios.post(apiUrl, {
          ...form,
          title: form.title.trim(),
        })
        showMessage('Task added successfully.')
      }
      resetForm()
      loadTasks()
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to save task.')
    } finally {
      setLoading(false)
    }
  }

  const editTask = (task) => {
    setIsEditing(true)
    setActiveTaskId(task._id)
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return
    setLoading(true)
    setError('')
    try {
      await axios.delete(`${apiUrl}/${id}`)
      showMessage('Task deleted successfully.')
      loadTasks()
    } catch (err) {
      setError('Unable to delete task.')
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    resetForm()
    setError('')
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Task Tracker</p>
          <h1>Build and manage your tasks</h1>
        </div>
        <div className="status-row">
          <div className="status-card">
            <strong>{tasks.length}</strong>
            <span>Total tasks</span>
          </div>
          <div className="status-card">
            <strong>{tasks.filter((task) => task.status === 'completed').length}</strong>
            <span>Completed</span>
          </div>
        </div>
      </header>

      <main>
        <section className="task-panel">
          <form className="task-form" onSubmit={submitForm}>
            <div className="form-title-row">
              <h2>{isEditing ? 'Edit task' : 'Add new task'}</h2>
              {isEditing && (
                <button type="button" className="button-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <label>
              Task title <span>*</span>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter task title"
                maxLength={100}
                required
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Add task details"
                rows={4}
                maxLength={500}
              />
            </label>

            <div className="form-row">
              <label>
                Status
                <select name="status" value={form.status} onChange={handleChange}>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Due date
                <input
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange}
                />
              </label>
            </div>

            <button type="submit" className="button-primary" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update task' : 'Create task'}
            </button>
          </form>

          <div className="task-list-panel">
            <div className="task-list-header">
              <div>
                <p className="eyebrow">Tasks</p>
                <h2>All tasks</h2>
              </div>
              <div className="filter-row">
                <label>
                  Filter
                  <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">All</option>
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Sort by
                  <select value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="createdAt">Newest</option>
                    <option value="dueDate">Due date</option>
                  </select>
                </label>
              </div>
            </div>

            {loading && !tasks.length ? (
              <div className="empty-state">Loading tasks…</div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state">No tasks found. Create a task to get started.</div>
            ) : (
              <div className="task-grid">
                {filteredTasks.map((task) => (
                  <article key={task._id} className={`task-card task-${task.status}`}>
                    <div className="task-card-top">
                      <div>
                        <h3>{task.title}</h3>
                        <p className="task-meta">{statusOptions.find((opt) => opt.value === task.status)?.label}</p>
                      </div>
                      <div className="task-actions">
                        <button type="button" onClick={() => editTask(task)}>
                          Edit
                        </button>
                        <button type="button" className="danger" onClick={() => deleteTask(task._id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="task-description">{task.description || 'No description.'}</p>
                    <div className="task-meta-row">
                      <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                      <span>{task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
