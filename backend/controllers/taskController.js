import mongoose from 'mongoose'
import Task from '../models/taskModel.js'
import { memoryTaskStore } from '../utils/taskStore.js'

const validateTask = (task) => {
    if (!task.title || task.title.trim().length === 0) {
        return 'Title is required.'
    }
    if (task.title.length > 100) {
        return 'Title must be 100 characters or fewer.'
    }
    if (task.description && task.description.length > 500) {
        return 'Description must be 500 characters or fewer.'
    }
    return null
}

const useMemoryStore = () => mongoose.connection.readyState !== 1

const buildTaskPayload = (body) => ({
    title: body.title.trim(),
    description: body.description?.trim() || '',
    status: body.status || 'pending',
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
})

export const getTasks = async(req, res) => {
    try {
        const { status } = req.query
        const filter = status && status !== 'all' ? { status } : {}
        const tasks = useMemoryStore() ?
            await memoryTaskStore.listTasks(filter) :
            await Task.find(filter).sort({ createdAt: -1 })
        res.json(tasks)
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch tasks.' })
    }
}

export const getTask = async(req, res) => {
    try {
        const task = useMemoryStore() ?
            await memoryTaskStore.getTask(req.params.id) :
            await Task.findById(req.params.id)
        if (!task) {
            return res.status(404).json({ error: 'Task not found.' })
        }
        res.json(task)
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch task.' })
    }
}

export const createTask = async(req, res) => {
    try {
        const validationError = validateTask(req.body)
        if (validationError) {
            return res.status(400).json({ error: validationError })
        }

        if (useMemoryStore()) {
            const savedTask = await memoryTaskStore.createTask(buildTaskPayload(req.body))
            return res.status(201).json(savedTask)
        }

        const task = new Task(buildTaskPayload(req.body))
        const savedTask = await task.save()
        res.status(201).json(savedTask)
    } catch (error) {
        console.error('createTask error:', error)
        res.status(500).json({ error: error.message || 'Unable to create task.' })
    }
}

export const updateTask = async(req, res) => {
    try {
        const validationError = validateTask(req.body)
        if (validationError) {
            return res.status(400).json({ error: validationError })
        }

        const updated = useMemoryStore() ?
            await memoryTaskStore.updateTask(req.params.id, buildTaskPayload(req.body)) :
            await Task.findByIdAndUpdate(req.params.id, buildTaskPayload(req.body), { new: true, runValidators: true })

        if (!updated) {
            return res.status(404).json({ error: 'Task not found.' })
        }

        res.json(updated)
    } catch (error) {
        console.error('updateTask error:', error)
        res.status(500).json({ error: error.message || 'Unable to update task.' })
    }
}

export const deleteTask = async(req, res) => {
    try {
        const deleted = useMemoryStore() ?
            await memoryTaskStore.deleteTask(req.params.id) :
            await Task.findByIdAndDelete(req.params.id)
        if (!deleted) {
            return res.status(404).json({ error: 'Task not found.' })
        }
        res.json({ message: 'Task deleted successfully.' })
    } catch (error) {
        console.error('deleteTask error:', error)
        res.status(500).json({ error: error.message || 'Unable to delete task.' })
    }
}