const tasks = []

const toTask = (task) => ({
    ...task,
    _id: task._id || `mem-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: task.createdAt || new Date().toISOString(),
})

export const memoryTaskStore = {
    async listTasks(filter = {}) {
        const filtered = tasks.filter((task) => {
            if (!filter.status || filter.status === 'all') {
                return true
            }
            return task.status === filter.status
        })
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    },

    async getTask(id) {
        return tasks.find((task) => task._id === id) || null
    },

    async createTask(payload) {
        const task = toTask({...payload, status: payload.status || 'pending' })
        tasks.unshift(task)
        return task
    },

    async updateTask(id, payload) {
        const index = tasks.findIndex((task) => task._id === id)
        if (index === -1) {
            return null
        }
        const updatedTask = toTask({...tasks[index], ...payload, _id: id })
        tasks[index] = updatedTask
        return updatedTask
    },

    async deleteTask(id) {
        const index = tasks.findIndex((task) => task._id === id)
        if (index === -1) {
            return null
        }
        const [deletedTask] = tasks.splice(index, 1)
        return deletedTask
    },
}