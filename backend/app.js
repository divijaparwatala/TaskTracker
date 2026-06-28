import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import taskRoutes from './routes/tasks.js'

dotenv.config()

const app = express()
const rawFrontendUrl = process.env.FRONTEND_URL || ''
const FRONTEND_URL = rawFrontendUrl.replace(/\/+$/, '')
const allowedOrigins = [
    FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
].filter(Boolean)

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error(`CORS origin denied: ${origin}`))
        }
    },
}

app.use(cors(corsOptions))
app.use(express.json())

app.use('/api/tasks', taskRoutes)

app.get('/', (req, res) => {
    res.json({ status: 'Task Tracker API is running' })
})

export default app