import { Router } from 'express'
import {
    createTask,
    deleteTask,
    getTask,
    getTasks,
    updateTask,
} from '../controllers/taskController.js'

const router = Router()

router.get('/', getTasks)
router.get('/:id', getTask)
router.post('/', createTask)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)

export default router